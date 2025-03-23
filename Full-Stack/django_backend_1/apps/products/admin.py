from django.contrib import admin
from .models import Product, Cart, CartItem, Order, OrderItem

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'quantity', 'price', 'active', 'created_at', 'updated_at')
    search_fields = ('name', 'desc', 'stripe_product_id')
    list_filter = ('active', 'created_at', 'updated_at')
    ordering = ('-created_at',)
    readonly_fields = ('stripe_product_id', 'stripe_price_id', 'created_at', 'updated_at')

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_items', 'total_price', 'created_at', 'updated_at')
    search_fields = ('user__email', 'user__username')
    list_filter = ('created_at', 'updated_at')
    readonly_fields = ('created_at', 'updated_at', 'total_items', 'total_price')
    inlines = [CartItemInline]

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('created_at',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'status', 'total_amount', 'created_at', 'updated_at')
    list_filter = ('status', 'created_at', 'updated_at')
    search_fields = ('user__email', 'user__username', 'stripe_checkout_id')
    readonly_fields = ('stripe_checkout_id', 'created_at', 'updated_at')
    inlines = [OrderItemInline]
    ordering = ('-created_at',)

    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing an existing object
            return self.readonly_fields + ('user', 'total_amount')
        return self.readonly_fields
