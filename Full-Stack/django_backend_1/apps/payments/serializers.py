from rest_framework import serializers
from .models import WalletBalance

class WalletBalanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletBalance
        fields = '__all__'
        read_only_fields = ('balance_eth', 'balance_usd', 'last_updated')  # Mark these fields as read-only

class BuyBLPTokensSerializer(serializers.Serializer):
    private_key = serializers.CharField(write_only=True, required=True)
    buyer_address = serializers.CharField(required=True)
    eth_amount = serializers.DecimalField(required=True, max_digits=20, decimal_places=8)

    