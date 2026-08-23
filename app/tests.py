from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from account.models import User
from .models import Category, Product


class ProductAPITests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Cups', slug='cups')
        self.product = Product.objects.create(
            category=self.category,
            name='Paper Cup 200ml',
            slug='paper-cup-200ml',
            image='products/cup.jpg',
            price=Decimal('9.99'),
            description='Eco-friendly paper cup.',
            stock=50,
        )

    def test_list_products_is_public(self):
        response = self.client.get(reverse('api-product-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_filter_products_by_category(self):
        other_category = Category.objects.create(name='Napkins', slug='napkins')
        Product.objects.create(
            category=other_category, name='Napkin Pack', slug='napkin-pack',
            image='products/napkin.jpg', price=Decimal('4.99'),
            description='Pack of napkins.', stock=100,
        )
        response = self.client.get(reverse('api-product-list'), {'category': 'cups'})
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['slug'], 'paper-cup-200ml')

    def test_unavailable_products_are_hidden(self):
        self.product.available = False
        self.product.save()
        response = self.client.get(reverse('api-product-list'))
        self.assertEqual(response.data['count'], 0)


class CartAndCheckoutAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='shopper', password='pass12345')
        self.category = Category.objects.create(name='Cups', slug='cups')
        self.product = Product.objects.create(
            category=self.category,
            name='Paper Cup 200ml',
            slug='paper-cup-200ml',
            image='products/cup.jpg',
            price=Decimal('10.00'),
            description='Eco-friendly paper cup.',
            stock=5,
        )

    def test_cart_requires_authentication(self):
        response = self.client.get(reverse('api-cart'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_add_to_cart_and_view_cart(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse('api-cart-add'), {'product_id': self.product.id, 'quantity': 2}
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['total_items'], 1)
        self.assertEqual(Decimal(response.data['subtotal']), Decimal('20.00'))

    def test_cannot_add_more_than_available_stock(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse('api-cart-add'), {'product_id': self.product.id, 'quantity': 99}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_checkout_creates_order_and_decrements_stock(self):
        self.client.force_authenticate(self.user)
        self.client.post(reverse('api-cart-add'), {'product_id': self.product.id, 'quantity': 2})

        response = self.client.post(reverse('api-checkout'), {
            'payment_method': 'COD',
            'shipping_address': '221B Baker Street',
            'contact_phone': '9999999999',
        })

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'PENDING')
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(Decimal(response.data['subtotal']), Decimal('20.00'))

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 3)

        cart_response = self.client.get(reverse('api-cart'))
        self.assertEqual(cart_response.data['total_items'], 0)

    def test_checkout_rejects_empty_cart(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(reverse('api-checkout'), {
            'payment_method': 'COD',
            'shipping_address': '221B Baker Street',
            'contact_phone': '9999999999',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_orders_are_scoped_to_the_requesting_user(self):
        other_user = User.objects.create_user(username='other', password='pass12345')
        self.client.force_authenticate(self.user)
        self.client.post(reverse('api-cart-add'), {'product_id': self.product.id, 'quantity': 1})
        self.client.post(reverse('api-checkout'), {
            'payment_method': 'COD',
            'shipping_address': '221B Baker Street',
            'contact_phone': '9999999999',
        })

        self.client.force_authenticate(other_user)
        response = self.client.get(reverse('api-order-list'))
        self.assertEqual(len(response.data['results']), 0)
