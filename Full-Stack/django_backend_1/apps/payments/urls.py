from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SendETHAPIView,
    BuyBLPTokensAPIView,
    PaymentViewSet,
    CryptoViewSet,
)

app_name = "payments"
# URL configuration for the payments app
router = DefaultRouter()
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'crypto', CryptoViewSet, basename='crypto')

urlpatterns = [
    path('', include(router.urls)),
    
    # Endpoint to send ETH to another wallet
    path('send-eth/', SendETHAPIView.as_view(), name='send-eth'),
    
    # Endpoint to buy BLP tokens
    path('buy-blp/', BuyBLPTokensAPIView.as_view(), name='buy-blp'),
]
