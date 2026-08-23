from django.urls import path
from rest_framework.routers import DefaultRouter

from .api_views import (
    CartItemDetailView,
    CartItemView,
    CartView,
    CategoryViewSet,
    CheckoutView,
    OrderDetailView,
    OrderListView,
    ProductViewSet,
)

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='api-category')
router.register('products', ProductViewSet, basename='api-product')

urlpatterns = router.urls + [
    path('cart/', CartView.as_view(), name='api-cart'),
    path('cart/items/', CartItemView.as_view(), name='api-cart-add'),
    path('cart/items/<int:pk>/', CartItemDetailView.as_view(), name='api-cart-item'),
    path('checkout/', CheckoutView.as_view(), name='api-checkout'),
    path('orders/', OrderListView.as_view(), name='api-order-list'),
    path('orders/<str:order_number>/', OrderDetailView.as_view(), name='api-order-detail'),
]
