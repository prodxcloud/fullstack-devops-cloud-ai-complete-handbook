from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from unittest.mock import patch, MagicMock

from ..models import Product, Cart, CartItem, Order, OrderItem
from ..views import StripeWebhookView

User = get_user_model()

class OrderTestCase(TestCase):
    def setUp(self):
        """Set up test data"""
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client = Client()
        self.client.login(username='testuser', password='testpass123')

        # Create test products
        self.product1 = Product.objects.create(
            name='Test Product 1',
            desc='Test Description 1',
            price=10.00,
            stripe_product_id='prod_test1',
            stripe_price_id='price_test1',
            active=True
        )
        self.product2 = Product.objects.create(
            name='Test Product 2',
            desc='Test Description 2',
            price=20.00,
            stripe_product_id='prod_test2',
            stripe_price_id='price_test2',
            active=True
        )

        # Create test cart with items
        self.cart = Cart.objects.create(user=self.user)
        self.cart_item1 = CartItem.objects.create(
            cart=self.cart,
            product=self.product1,
            quantity=2
        )
        self.cart_item2 = CartItem.objects.create(
            cart=self.cart,
            product=self.product2,
            quantity=1
        )

    def test_create_order(self):
        """Test order creation"""
        order = Order.objects.create(
            user=self.user,
            status='pending',
            total_amount=40.00  # (2 * 10) + (1 * 20)
        )
        
        # Create order items
        OrderItem.objects.create(
            order=order,
            product=self.product1,
            quantity=2,
            price=self.product1.price
        )
        OrderItem.objects.create(
            order=order,
            product=self.product2,
            quantity=1,
            price=self.product2.price
        )

        self.assertEqual(order.user, self.user)
        self.assertEqual(order.status, 'pending')
        self.assertEqual(order.total_amount, 40.00)
        self.assertEqual(order.items.count(), 2)

    @patch('stripe.checkout.Session.create')
    def test_checkout_process(self, mock_stripe_session):
        """Test the checkout process"""
        # Mock Stripe checkout session
        mock_stripe_session.return_value = MagicMock(
            id='cs_test123',
            url='https://checkout.stripe.com/test'
        )

        # Make checkout request
        response = self.client.post(reverse('checkout'))
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('checkout_url', response.data)
        self.assertIn('order_id', response.data)

        # Verify order was created
        order = Order.objects.get(id=response.data['order_id'])
        self.assertEqual(order.user, self.user)
        self.assertEqual(order.status, 'pending')
        self.assertEqual(order.items.count(), 2)

    def test_order_list(self):
        """Test retrieving order list"""
        # Create some test orders
        Order.objects.create(
            user=self.user,
            status='completed',
            total_amount=40.00
        )
        Order.objects.create(
            user=self.user,
            status='pending',
            total_amount=30.00
        )

        # Get order list
        response = self.client.get(reverse('order-list'))
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    @patch('stripe.Webhook.construct_event')
    def test_stripe_webhook(self, mock_construct_event):
        """Test Stripe webhook handling"""
        # Create a test order
        order = Order.objects.create(
            user=self.user,
            status='pending',
            total_amount=40.00
        )

        # Mock Stripe event
        mock_event = {
            'type': 'checkout.session.completed',
            'data': {
                'object': {
                    'metadata': {
                        'order_id': str(order.id)
                    }
                }
            }
        }
        mock_construct_event.return_value = mock_event

        # Send webhook request
        response = self.client.post(
            reverse('stripe-webhook'),
            data='{}',  # Raw payload doesn't matter as we're mocking
            content_type='application/json',
            HTTP_STRIPE_SIGNATURE='test_signature'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify order was updated
        order.refresh_from_db()
        self.assertEqual(order.status, 'completed')

    def test_order_total_calculation(self):
        """Test order total calculation"""
        order = Order.objects.create(
            user=self.user,
            status='pending',
            total_amount=0
        )

        # Add items to order
        OrderItem.objects.create(
            order=order,
            product=self.product1,
            quantity=3,
            price=self.product1.price
        )
        OrderItem.objects.create(
            order=order,
            product=self.product2,
            quantity=2,
            price=self.product2.price
        )

        # Calculate expected total: (3 * 10) + (2 * 20) = 70
        expected_total = (3 * self.product1.price) + (2 * self.product2.price)
        
        # Update order total
        order.total_amount = sum(
            item.quantity * item.price 
            for item in order.items.all()
        )
        order.save()

        self.assertEqual(order.total_amount, expected_total)

    def test_order_status_transitions(self):
        """Test order status transitions"""
        order = Order.objects.create(
            user=self.user,
            status='pending',
            total_amount=40.00
        )

        # Test initial status
        self.assertEqual(order.status, 'pending')

        # Test transition to processing
        order.status = 'processing'
        order.save()
        self.assertEqual(order.status, 'processing')

        # Test transition to completed
        order.status = 'completed'
        order.save()
        self.assertEqual(order.status, 'completed')

    def test_empty_cart_checkout(self):
        """Test checkout with empty cart"""
        # Clear the cart
        self.cart.items.all().delete()

        # Attempt checkout
        response = self.client.post(reverse('checkout'))
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Cart is empty')

    def test_inactive_product_checkout(self):
        """Test checkout with inactive product"""
        # Make a product inactive
        self.product1.active = False
        self.product1.save()

        # Attempt checkout
        response = self.client.post(reverse('checkout'))
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data) 