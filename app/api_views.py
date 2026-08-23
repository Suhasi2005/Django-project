import uuid
from decimal import Decimal

from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cart, CartItem, Category, Order, OrderItem, Product
from .serializers import (
    CartItemSerializer,
    CartSerializer,
    CategorySerializer,
    CheckoutSerializer,
    OrderSerializer,
    ProductSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        queryset = Product.objects.filter(available=True).order_by('id')
        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        return queryset


class CartView(APIView):
    """Return the current user's cart, creating an empty one if needed."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return Response(CartSerializer(cart).data)


class CartItemView(APIView):
    """Add a product to the current user's cart."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.validated_data['product']
        quantity = serializer.validated_data.get('quantity', 1)

        item, created = CartItem.objects.get_or_create(
            cart=cart, product=product, defaults={'quantity': quantity}
        )
        if not created:
            new_quantity = item.quantity + quantity
            if new_quantity > product.stock:
                return Response(
                    {'detail': f'Only {product.stock} unit(s) of {product.name} left in stock.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            item.quantity = new_quantity
            item.save()

        return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED)


class CartItemDetailView(APIView):
    """Update the quantity of, or remove, a single cart item."""
    permission_classes = [permissions.IsAuthenticated]

    def get_item(self, request, pk):
        return get_object_or_404(CartItem, pk=pk, cart__user=request.user)

    def patch(self, request, pk):
        item = self.get_item(request, pk)
        quantity = request.data.get('quantity')
        if quantity is None or int(quantity) < 1:
            return Response(
                {'detail': 'quantity must be a positive integer.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if int(quantity) > item.product.stock:
            return Response(
                {'detail': f'Only {item.product.stock} unit(s) of {item.product.name} left in stock.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        item.quantity = int(quantity)
        item.save()
        return Response(CartSerializer(item.cart).data)

    def delete(self, request, pk):
        item = self.get_item(request, pk)
        cart = item.cart
        item.delete()
        return Response(CartSerializer(cart).data)


class CheckoutView(APIView):
    """
    Turn the current user's cart into an Order: validates stock, snapshots
    price/name onto each OrderItem, decrements stock, and empties the cart.
    Wrapped in a single transaction so a failure never leaves stock or the
    cart in a half-updated state.
    """
    permission_classes = [permissions.IsAuthenticated]

    TAX_RATE = Decimal('0.05')
    FLAT_SHIPPING = Decimal('49.00')

    @transaction.atomic
    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        items = list(cart.items.select_related('product').select_for_update())

        if not items:
            return Response({'detail': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        checkout = CheckoutSerializer(data=request.data)
        checkout.is_valid(raise_exception=True)

        for item in items:
            if item.quantity > item.product.stock:
                return Response(
                    {'detail': f'Only {item.product.stock} unit(s) of {item.product.name} left in stock.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        subtotal = sum((item.total_price for item in items), Decimal('0'))
        tax = (subtotal * self.TAX_RATE).quantize(Decimal('0.01'))
        shipping_cost = self.FLAT_SHIPPING
        total = subtotal + tax + shipping_cost

        order = Order.objects.create(
            user=request.user,
            order_number=uuid.uuid4().hex[:12].upper(),
            payment_method=checkout.validated_data['payment_method'],
            subtotal=subtotal,
            tax=tax,
            shipping_cost=shipping_cost,
            total=total,
            shipping_address=checkout.validated_data['shipping_address'],
            billing_address=checkout.validated_data.get('billing_address', ''),
            contact_phone=checkout.validated_data['contact_phone'],
            notes=checkout.validated_data.get('notes', ''),
        )

        for item in items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price,
                name=item.product.name,
            )
            item.product.stock -= item.quantity
            item.product.save(update_fields=['stock'])

        cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'order_number'

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)
