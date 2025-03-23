"""
Product Management Models Module

This module defines the data models for managing products, carts, and orders in an e-commerce system.
It provides a comprehensive set of models that integrate with Stripe for payment processing and
handle the complete order lifecycle.

Models:
    - Product: Represents products available in the store
    - Cart: Represents a user's shopping cart
    - CartItem: Represents items in a shopping cart
    - Order: Represents a customer order
    - OrderItem: Represents items within an order

The models in this module implement a robust e-commerce system with features including:
    - Stripe integration for payment processing
    - Shopping cart management
    - Order tracking and status management
    - Price history and inventory tracking
    - Product metadata and categorization

Dependencies:
    - django.db.models: Core Django ORM functionality
    - django.core.validators: Validation utilities
    - django.contrib.auth: User authentication
    - uuid: For generating unique identifiers
"""

import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator

User = get_user_model()

class Product(models.Model):
    """
    Product model representing items available in the store.

    This model stores all product-related information and integrates with Stripe
    for payment processing. It maintains both local pricing and Stripe pricing
    information for synchronization purposes.

    Attributes:
        id (UUIDField): Unique identifier for the product
        name (CharField): Product name
        desc (TextField): Detailed product description
        active (BooleanField): Whether the product is available for purchase
        price (FloatField): Display price in the store (in dollars)
        thumbnail (URLField): URL to product image
        quantity (IntegerField): Available stock quantity
        tags (JSONField): List of tags for categorization
        stripe_product_id (CharField): Stripe product identifier
        stripe_price_id (CharField): Stripe price identifier
        default_price (FloatField): Actual price used for calculations
        created_at (DateTimeField): Timestamp of creation
        updated_at (DateTimeField): Timestamp of last update
        
    Stripe-specific fields:
        livemode (BooleanField): Whether the product is in live mode in Stripe
        marketing_features (JSONField): Marketing-related features
        metadata (JSONField): Additional product metadata
        package_dimensions (JSONField): Product dimensions for shipping
        shippable (BooleanField): Whether the product can be shipped
        statement_descriptor (CharField): Description for bank statements
        tax_code (CharField): Tax classification code
        type (CharField): Product type (e.g., 'service', 'good')
        unit_label (CharField): Label for product units
        updated (BigIntegerField): Stripe update timestamp
        url (URLField): External product URL

    Methods:
        __str__: Returns the product name
        save: Custom save method with additional logic

    Meta:
        ordering: Orders products by creation date, newest first
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    desc = models.TextField(blank=True, null=True)
    active = models.BooleanField(default=True)
    price = models.FloatField(default=0.0)
    thumbnail = models.URLField(max_length=500, blank=True, null=True)
    quantity = models.IntegerField(default=1)
    tags = models.JSONField(default=list)
    stripe_product_id = models.CharField(max_length=100, unique=True)
    stripe_price_id = models.CharField(max_length=100, blank=True, null=True)
    default_price = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Additional Stripe fields
    livemode = models.BooleanField(default=False, blank=True)
    marketing_features = models.JSONField(default=list, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    package_dimensions = models.JSONField(null=True, blank=True)
    shippable = models.BooleanField(null=True, blank=True)
    statement_descriptor = models.CharField(max_length=255, null=True, blank=True)
    tax_code = models.CharField(max_length=255, null=True, blank=True)
    type = models.CharField(max_length=50, default='service', blank=True)
    unit_label = models.CharField(max_length=255, null=True, blank=True)
    updated = models.BigIntegerField(null=True, blank=True)
    url = models.URLField(max_length=500, null=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-created_at']

class Cart(models.Model):
    """
    Shopping cart model representing a user's current shopping session.

    This model maintains the relationship between users and their selected products,
    tracking the items they intend to purchase. It provides methods for calculating
    totals and managing cart items.

    Attributes:
        id (UUIDField): Unique identifier for the cart
        user (OneToOneField): The user who owns this cart
        created_at (DateTimeField): When the cart was created
        updated_at (DateTimeField): When the cart was last modified

    Properties:
        total_items: Calculates the total number of items in the cart
        total_price: Calculates the total price of all items in the cart

    Methods:
        __str__: Returns a string representation of the cart

    Related Models:
        - CartItem: Through model for product quantities
        - User: Owner of the cart
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart for {self.user.email}"

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def total_price(self):
        return sum(item.subtotal for item in self.items.all())

class CartItem(models.Model):
    """
    Model representing individual items in a shopping cart.

    This model maintains the many-to-many relationship between carts and products,
    storing quantity information and providing methods for subtotal calculations.

    Attributes:
        id (UUIDField): Unique identifier for the cart item
        cart (ForeignKey): Reference to the parent cart
        product (ForeignKey): Reference to the product
        quantity (IntegerField): Number of this product in the cart
        created_at (DateTimeField): When the item was added
        updated_at (DateTimeField): When the item was last modified

    Properties:
        subtotal: Calculates the total price for this item (quantity * price)

    Methods:
        __str__: Returns a string representation of the cart item

    Meta:
        unique_together: Ensures no duplicate products in the same cart
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('cart', 'product')

    @property
    def subtotal(self):
        return self.product.default_price * self.quantity if self.product.default_price else 0.0

    def __str__(self):
        return f"{self.quantity}x {self.product.name} in {self.cart}"

class Order(models.Model):
    """
    Model representing a customer order.

    This model tracks the complete lifecycle of an order, from creation through
    payment processing and fulfillment. It integrates with Stripe for payment
    processing and maintains order status and history.

    Attributes:
        id (UUIDField): Unique identifier for the order
        user (ForeignKey): Customer who placed the order
        status (CharField): Current order status
        total_amount (FloatField): Total order amount
        stripe_checkout_id (CharField): Stripe checkout session ID
        created_at (DateTimeField): When the order was placed
        updated_at (DateTimeField): When the order was last modified

    Status Choices:
        - pending: Order created but not paid
        - paid: Payment received
        - failed: Payment failed
        - completed: Order fulfilled

    Methods:
        __str__: Returns a string representation of the order

    Related Models:
        - OrderItem: Individual items in the order
        - User: Customer who placed the order
    """
    class OrderStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PROCESSING = 'processing', 'Processing'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
        FAILED = 'failed', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING
    )
    total_amount = models.FloatField(default=0.0)
    stripe_checkout_id = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.id} - {self.status}"

class OrderItem(models.Model):
    """
    Model representing individual items within an order.

    This model maintains the details of each product purchased in an order,
    including the quantity and price at the time of purchase. This historical
    price record is important for order accuracy and audit purposes.

    Attributes:
        id (UUIDField): Unique identifier for the order item
        order (ForeignKey): Reference to the parent order
        product (ForeignKey): Reference to the purchased product
        quantity (IntegerField): Number of units purchased
        price (FloatField): Price at time of purchase
        created_at (DateTimeField): When the item was added to the order

    Methods:
        __str__: Returns a string representation of the order item

    Related Models:
        - Order: Parent order
        - Product: Product that was purchased
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    price = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quantity}x {self.product.name} in Order {self.order.id}" 