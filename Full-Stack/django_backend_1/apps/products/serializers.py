from rest_framework import serializers
from .models import Product, Cart, CartItem, Order, OrderItem

class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer for the Product model.
    Handles both numeric prices and Stripe price IDs.
    """
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'desc', 'active', 'price', 'thumbnail',
            'quantity', 'tags', 'stripe_product_id', 'stripe_price_id',
            'default_price', 'created_at', 'updated_at', 'livemode',
            'marketing_features', 'metadata', 'package_dimensions',
            'shippable', 'statement_descriptor', 'tax_code', 'type',
            'unit_label', 'updated', 'url'
        ]

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'created_at', 'updated_at']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total', 'created_at', 'updated_at']

    def get_total(self, obj):
        return sum(item.product.default_price * item.quantity for item in obj.items.all())

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price', 'created_at']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'status', 'total_amount', 'stripe_checkout_id', 
                 'items', 'created_at', 'updated_at']
        read_only_fields = ['user', 'stripe_checkout_id']

class CheckoutItemSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1)
    price = serializers.FloatField(min_value=0)

class CheckoutSerializer(serializers.Serializer):
    items = CheckoutItemSerializer(many=True)

    def validate(self, data):
        if not data['items']:
            raise serializers.ValidationError("No items provided for checkout")
        return data 