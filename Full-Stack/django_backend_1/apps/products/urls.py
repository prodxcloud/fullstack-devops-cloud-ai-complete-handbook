from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, CartView, CartAddView, CartRemoveView,
    CartUpdateView, CartClearView, CheckoutSessionView,
    OrderListView, StripeWebhookView
)

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),
    
    # Cart endpoints
    path('carts/', CartView.as_view(), name='cart'),
    path('carts/add/', CartAddView.as_view(), name='cart-add'),
    path('carts/remove/', CartRemoveView.as_view(), name='cart-remove'),
    path('carts/update/', CartUpdateView.as_view(), name='cart-update'),
    path('carts/clear/', CartClearView.as_view(), name='cart-clear'),
    
    # Checkout and order endpoints
    path('checkout/', CheckoutSessionView.as_view(), name='checkout'),
    path('orders/', OrderListView.as_view(), name='order-list'),
    path('webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),
]
