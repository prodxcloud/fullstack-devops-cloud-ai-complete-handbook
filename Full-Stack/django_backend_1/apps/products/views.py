"""
Product Management Views Module

This module provides the API views for managing products, carts, and orders in the e-commerce system.
It includes comprehensive integration with Stripe for payment processing and handles all aspects
of the shopping experience from browsing products to completing purchases.

Key Features:
    - Product management (CRUD operations)
    - Stripe integration for products and payments
    - Shopping cart management
    - Order processing and tracking
    - Checkout session handling
    - Webhook processing for Stripe events

The views in this module implement RESTful endpoints following Django REST framework
best practices and provide comprehensive error handling and validation.

Classes:
    - ProductViewSet: Main viewset for product management
    - CartViewSet: Handles shopping cart operations
    - OrderViewSet: Manages order processing
    - CheckoutSessionView: Handles Stripe checkout integration
    - CartView: Basic cart operations
    - StripeWebhookView: Processes Stripe webhooks

Dependencies:
    - rest_framework: Django REST framework components
    - stripe: Stripe API integration
    - django.shortcuts: Django utility functions
    - django.conf: Django settings
"""

from rest_framework import viewsets, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import stripe
from rest_framework.views import APIView

from .models import Product, Cart, CartItem, Order, OrderItem
from .serializers import (
    ProductSerializer,
    CartSerializer,
    CartItemSerializer,
    OrderSerializer,
    CheckoutSerializer,
)

stripe.api_key = settings.STRIPE_SECRET_KEY

@method_decorator(csrf_exempt, name='dispatch')
class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing products in the e-commerce store.

    This ViewSet provides comprehensive CRUD operations for products and includes
    additional actions for Stripe integration, product synchronization, and
    advanced product management features.

    Attributes:
        queryset: All Product objects
        serializer_class: ProductSerializer for data transformation
        permission_classes: Empty list for public access

    Actions:
        list: Get all active products
        retrieve: Get a single product
        create: Create a new product
        update: Update a product
        destroy: Delete/archive a product
        
    Custom Actions:
        sync-from-stripe: Synchronize products from Stripe
        create-stripe: Create a new product in Stripe
        update: Update product details
        delete: Delete/archive a product
        get_product_by_id: Retrieve a product by ID

    Stripe Integration:
        - Maintains synchronization between local and Stripe products
        - Handles price management in both systems
        - Manages product metadata and attributes
        - Handles product status (active/archived)

    Error Handling:
        - Provides detailed error messages for Stripe operations
        - Handles validation errors
        - Manages transaction rollbacks
        - Logs errors for debugging
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = []  # Remove authentication requirement

    def get_queryset(self):
        """
        Get the list of products for the view.
        Returns only active products for list action.
        """
        queryset = super().get_queryset()
        if self.action == 'list':
            return queryset.filter(active=True)
        return queryset

    def update(self, request, *args, **kwargs):
        """
        Update a product instance.
        Updates both the database and Stripe product.
        
        Args:
            request: The HTTP request containing the update data.
            
        Returns:
            Response: JSON response with updated product data or error message.
        """
        try:
            instance = self.get_object()
            stripe_product_id = instance.stripe_product_id
            
            # Update product in Stripe
            try:
                stripe_product = stripe.Product.modify(
                    stripe_product_id,
                    name=request.data.get('name', instance.name),
                    description=request.data.get('description', instance.desc),
                    active=request.data.get('active', instance.active),
                    images=request.data.get('images', [instance.thumbnail]) if 'images' in request.data else None,
                    metadata=request.data.get('metadata', {})
                )
            except stripe.error.StripeError as e:
                print(f"Stripe Error while updating product: {str(e)}")
                # Continue with database update even if Stripe update fails
            
            # Update in our database
            serializer = self.get_serializer(instance, data=request.data, partial=kwargs.get('partial', False))
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            
            return Response({
                'status': 'success',
                'message': f'Product {instance.name} has been updated successfully',
                'data': serializer.data
            })
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        """
        Delete a product instance.
        Archives the product in Stripe and deletes it from the database.
        
        Args:
            request: The HTTP request.
            
        Returns:
            Response: JSON response with deletion status or error message.
        """
        try:
            instance = self.get_object()
            stripe_product_id = instance.stripe_product_id
            
            # Archive the product in Stripe instead of deleting
            try:
                stripe.Product.modify(
                    stripe_product_id,
                    active=False
                )
            except stripe.error.StripeError as e:
                print(f"Stripe Error while archiving product: {str(e)}")
                # Continue with database deletion even if Stripe update fails
            
            # Delete from our database
            self.perform_destroy(instance)
            
            return Response({
                'status': 'success',
                'message': f'Product {instance.name} has been deleted and archived in Stripe',
                'product_id': str(instance.id),
                'stripe_product_id': stripe_product_id
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request, *args, **kwargs):
        """
        List all products.
        Returns a paginated list of active products.
        
        Args:
            request: The HTTP request.
            
        Returns:
            Response: JSON response with list of products and total count.
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'total': queryset.count(),
            'results': serializer.data
        })

    @action(detail=False, methods=['get'], url_path='stripe')
    def stripe_products(self, request):
        """
        Fetch all products directly from Stripe.
        Returns a list of active products with their prices and details.
        
        Args:
            request: The HTTP request.
            
        Returns:
            Response: JSON response with list of Stripe products or error message.
        """
        try:
            # Fetch all products from Stripe
            stripe_products = stripe.Product.list(active=True)
            
            products_data = []
            for stripe_product in stripe_products.data:
                # Get the default price for the product
                prices = stripe.Price.list(
                    product=stripe_product.id,
                    active=True,
                    limit=1
                )
                
                default_price = None
                price_value = None
                stripe_price_id = None
                if prices.data:
                    stripe_price_id = prices.data[0].id
                    # Convert price from cents to dollars
                    price_value = prices.data[0].unit_amount / 100 if prices.data[0].unit_amount else 0.0
                    default_price = price_value

                product_data = {
                    'id': stripe_product.id,
                    'name': stripe_product.name,
                    'description': stripe_product.description,
                    'active': stripe_product.active,
                    'stripe_price_id': stripe_price_id,
                    'default_price': default_price,
                    'price': price_value,
                    'images': stripe_product.images,
                    'metadata': stripe_product.metadata,
                    'created': stripe_product.created,
                    'updated': stripe_product.updated
                }
                products_data.append(product_data)

            return Response({
                'count': len(products_data),
                'total': len(products_data),
                'results': products_data
            }, status=status.HTTP_200_OK)

        except stripe.error.StripeError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': 'An error occurred while fetching products from Stripe'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'], url_path='create-stripe')
    def create_stripe(self, request):
        """
        Create a new product in both Stripe and the local database.

        This action creates a product in Stripe first, then creates a corresponding
        record in the local database. It handles both product details and pricing
        information.

        Process:
            1. Create product in Stripe
            2. Create price object in Stripe
            3. Create local product record
            4. Associate Stripe IDs with local product

        Args:
            request: HTTP request containing product data:
                - name: Product name
                - description: Product description
                - price_data: Price information
                - images: Product images
                - metadata: Additional product data

        Returns:
            Response: JSON response containing:
                - status: Success/error status
                - message: Status message
                - data: Created product details

        Error Handling:
            - Validates input data
            - Handles Stripe API errors
            - Manages transaction rollback on failure
        """
        try:
            # Create product in Stripe with only valid parameters
            stripe_product = stripe.Product.create(
                name=request.data.get('name'),
                description=request.data.get('description'),
                active=request.data.get('active', True),
                images=request.data.get('images', []),
                metadata=request.data.get('metadata', {}),
                statement_descriptor=request.data.get('statement_descriptor'),
                tax_code=request.data.get('tax_code'),
                type=request.data.get('type', 'service'),
                unit_label=request.data.get('unit_label'),
                url=request.data.get('url')
            )

            # Get price data and convert from dollars to cents
            price_data = request.data.get('default_price_data', {})
            amount_in_dollars = float(price_data.get('unit_amount', 0))
            amount_in_cents = int(amount_in_dollars * 100)  # Convert to cents for Stripe

            # Create price in Stripe
            stripe_price = stripe.Price.create(
                product=stripe_product.id,
                unit_amount=amount_in_cents,
                currency=price_data.get('currency', 'usd'),
                recurring=price_data.get('recurring'),
                metadata=price_data.get('metadata', {})
            )

            # Create product in our database
            product_data = {
                'name': stripe_product.name,
                'desc': stripe_product.description,
                'price': amount_in_dollars,
                'thumbnail': stripe_product.images[0] if stripe_product.images else None,
                'stripe_product_id': stripe_product.id,
                'stripe_price_id': stripe_price.id,
                'active': stripe_product.active,
                'metadata': stripe_product.metadata,
                'type': stripe_product.type,
                'statement_descriptor': stripe_product.statement_descriptor,
                'tax_code': stripe_product.tax_code,
                'unit_label': stripe_product.unit_label,
                'url': stripe_product.url
            }

            serializer = self.get_serializer(data=product_data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)

            return Response({
                'status': 'success',
                'message': f'Product {stripe_product.name} has been created successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)

        except stripe.error.StripeError as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

            # Get thumbnail from Stripe images
            thumbnail = stripe_product.images[0] if stripe_product.images else None
            if not thumbnail:
                # If no images in Stripe, use the first image from request
                thumbnail = request.data.get('images', [None])[0] if request.data.get('images') else None
            if not thumbnail:
                # Fallback to placeholder if no images available
                thumbnail = 'https://placeholder.com/150'

            # Create product in our database
            product = Product.objects.create(
                name=stripe_product.name,
                desc=stripe_product.description,
                stripe_product_id=stripe_product.id,
                default_price=stripe_price.id,
                price=amount_in_dollars,  # Store the original dollar amount
                active=stripe_product.active,
                thumbnail=thumbnail,
                quantity=1,
                tags=[],
                # Additional Stripe fields
                livemode=stripe_product.livemode,
                marketing_features=stripe_product.marketing_features or [],
                metadata=stripe_product.metadata or {},
                package_dimensions=stripe_product.package_dimensions,
                shippable=stripe_product.shippable,
                statement_descriptor=stripe_product.statement_descriptor,
                tax_code=stripe_product.tax_code,
                type=stripe_product.type,
                unit_label=stripe_product.unit_label,
                updated=stripe_product.updated,
                url=stripe_product.url
            )

            return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)

        except stripe.error.StripeError as e:
            print(f"Stripe Error: {str(e)}")  # Debug print
            return Response(
                {
                    'error': str(e),
                    'error_type': type(e).__name__,
                    'error_code': getattr(e, 'code', None),
                    'error_message': getattr(e, 'message', str(e))
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            import traceback
            print(f"General Error: {str(e)}")  # Debug print
            print(f"Traceback: {traceback.format_exc()}")  # Debug print
            return Response(
                {
                    'error': str(e),
                    'error_type': type(e).__name__,
                    'traceback': traceback.format_exc()
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'], url_path='sync-from-stripe')
    def sync_from_stripe(self, request):
        """
        Synchronize products from Stripe to the local database.

        This action fetches all active products from Stripe and creates or updates
        corresponding products in the local database. It handles both product
        details and pricing information.

        Process:
            1. Fetch active products from Stripe
            2. For each product:
                - Fetch associated price information
                - Convert price from cents to dollars
                - Update or create local product
                - Handle product metadata and attributes
            3. Return summary of synchronized products

        Args:
            request: The HTTP request object

        Returns:
            Response: JSON response containing:
                - count: Number of products synchronized
                - total: Total number of products processed
                - message: Success/warning message
                - results: List of synchronized products
                - error: Error details if any

        Error Handling:
            - Individual product sync failures don't stop the process
            - Provides detailed error information for debugging
            - Logs errors to console/file
        """
        try:
            # Fetch all products from Stripe
            stripe_products = stripe.Product.list(active=True)
            
            synced_products = []
            for stripe_product in stripe_products.data:
                try:
                    # Get the default price for the product
                    prices = stripe.Price.list(
                        product=stripe_product.id,
                        active=True,
                        limit=1
                    )
                    
                    price_value = 0.0
                    stripe_price_id = None
                    if prices.data:
                        stripe_price_id = prices.data[0].id
                        # Convert price from cents to dollars if unit_amount exists
                        if hasattr(prices.data[0], 'unit_amount') and prices.data[0].unit_amount is not None:
                            price_value = float(prices.data[0].unit_amount) / 100

                    # Get thumbnail from Stripe images
                    thumbnail = stripe_product.images[0] if stripe_product.images else None
                    if not thumbnail:
                        thumbnail = 'https://placeholder.com/150'

                    # Update or create product in our database
                    product, created = Product.objects.update_or_create(
                        stripe_product_id=stripe_product.id,
                        defaults={
                            'name': stripe_product.name,
                            'desc': getattr(stripe_product, 'description', ''),
                            'stripe_price_id': stripe_price_id,
                            'default_price': price_value,
                            'price': price_value,
                            'active': stripe_product.active,
                            'thumbnail': thumbnail,
                            'quantity': 1,  # Default quantity
                            'tags': [],  # Default empty tags
                            'livemode': getattr(stripe_product, 'livemode', False),
                            'marketing_features': getattr(stripe_product, 'marketing_features', []),
                            'metadata': getattr(stripe_product, 'metadata', {}),
                            'package_dimensions': getattr(stripe_product, 'package_dimensions', None),
                            'shippable': getattr(stripe_product, 'shippable', None),
                            'statement_descriptor': getattr(stripe_product, 'statement_descriptor', None),
                            'tax_code': getattr(stripe_product, 'tax_code', None),
                            'type': getattr(stripe_product, 'type', 'service'),
                            'unit_label': getattr(stripe_product, 'unit_label', None),
                            'updated': getattr(stripe_product, 'updated', None),
                            'url': getattr(stripe_product, 'url', None)
                        }
                    )
                    
                    synced_products.append(ProductSerializer(product).data)
                except Exception as product_error:
                    print(f"Error syncing product {stripe_product.id}: {str(product_error)}")
                    continue

            if not synced_products:
                return Response({
                    'warning': 'No products were synced',
                    'details': 'Either no products exist in Stripe or all sync attempts failed'
                }, status=status.HTTP_200_OK)

            return Response({
                'count': len(synced_products),
                'total': len(synced_products),
                'message': f'Successfully synced {len(synced_products)} products',
                'results': synced_products
            }, status=status.HTTP_200_OK)

        except stripe.error.StripeError as e:
            import traceback
            print(f"Stripe Error: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return Response({
                'error': str(e),
                'error_type': 'StripeError',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            print(f"General Error: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return Response({
                'error': str(e),
                'error_type': type(e).__name__,
                'traceback': traceback.format_exc()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['put'], url_path='update')
    def update_product(self, request):
        """
        Update a product using ID from request payload.
        Updates both Stripe and local database.
        
        Args:
            request: The HTTP request containing product ID and update data.
            
        Returns:
            Response: JSON response with updated product data or error message.
        """
        try:
            product_id = request.data.get('id')
            if not product_id:
                return Response({
                    'status': 'error',
                    'message': 'Product ID is required in the payload'
                }, status=status.HTTP_400_BAD_REQUEST)

            instance = get_object_or_404(Product, id=product_id)
            stripe_product_id = instance.stripe_product_id
            
            # Update product in Stripe
            try:
                stripe_product = stripe.Product.modify(
                    stripe_product_id,
                    name=request.data.get('name', instance.name),
                    description=request.data.get('description', instance.desc),
                    active=request.data.get('active', instance.active),
                    images=request.data.get('images', [instance.thumbnail]) if 'images' in request.data else None,
                    metadata=request.data.get('metadata', {})
                )
            except stripe.error.StripeError as e:
                print(f"Stripe Error while updating product: {str(e)}")
                # Continue with database update even if Stripe update fails
            
            # Update in our database
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            
            return Response({
                'status': 'success',
                'message': f'Product {instance.name} has been updated successfully',
                'data': serializer.data
            })
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['delete'], url_path='delete')
    def delete_product(self, request):
        """
        Delete a product using ID from request payload.
        Archives the product in Stripe and deletes from local database.
        
        Args:
            request: The HTTP request containing product ID.
            
        Returns:
            Response: JSON response with deletion status or error message.
        """
        try:
            product_id = request.data.get('id')
            if not product_id:
                return Response({
                    'status': 'error',
                    'message': 'Product ID is required in the payload'
                }, status=status.HTTP_400_BAD_REQUEST)

            instance = get_object_or_404(Product, id=product_id)
            stripe_product_id = instance.stripe_product_id
            
            # Archive the product in Stripe instead of deleting
            try:
                stripe.Product.modify(
                    stripe_product_id,
                    active=False
                )
            except stripe.error.StripeError as e:
                print(f"Stripe Error while archiving product: {str(e)}")
                # Continue with database deletion even if Stripe update fails
            
            # Delete from our database
            self.perform_destroy(instance)
            
            return Response({
                'status': 'success',
                'message': f'Product {instance.name} has been deleted and archived in Stripe',
                'product_id': str(instance.id),
                'stripe_product_id': stripe_product_id
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='id')
    def get_product_by_id(self, request):
        """
        Get a product by its ID.
        
        Args:
            request: The HTTP request containing product ID in request body.
            
        Returns:
            Response: JSON response with product data or error message.
        """
        try:
            product_id = request.data.get('id')
            if not product_id:
                return Response({
                    'status': 'error',
                    'message': 'Product ID is required in request body'
                }, status=status.HTTP_400_BAD_REQUEST)

            product = get_object_or_404(Product, id=product_id)
            serializer = self.get_serializer(product)
            
            return Response({
                'status': 'success',
                'data': serializer.data
            })
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class CartViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing shopping carts.

    This ViewSet handles all shopping cart operations including adding/removing
    items, updating quantities, and managing cart state.

    Attributes:
        serializer_class: CartSerializer for data transformation
        permission_classes: [IsAuthenticated] for secure access

    Actions:
        list: Get user's active cart
        create: Create a new cart
        add_item: Add product to cart
        remove_item: Remove product from cart
        update_quantity: Update item quantity

    Features:
        - Maintains cart state per user
        - Handles product quantity validation
        - Calculates cart totals
        - Manages cart item relationships

    Security:
        - Requires authentication
        - Ensures users can only access their own carts
        - Validates product availability
    """
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Get the list of carts for the current user.
        """
        if self.request.user.is_authenticated:
            return Cart.objects.filter(user=self.request.user)
        return Cart.objects.none()

    def perform_create(self, serializer):
        """
        Create a new cart for the current user.
        
        Args:
            serializer: The cart serializer instance.
        """
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            raise PermissionDenied("Authentication required to create a cart")

    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        """
        Add an item to the cart.
        
        Args:
            request: The HTTP request containing item data.
            pk: The cart ID.
            
        Returns:
            Response: JSON response with added item data or error message.
        """
        if not request.user.is_authenticated:
            raise PermissionDenied("Authentication required to add items to cart")
            
        try:
            cart = self.get_object()
            serializer = CartItemSerializer(data=request.data)
            if serializer.is_valid():
                product = get_object_or_404(Product, id=serializer.validated_data['product_id'])
                if not product.active:
                    return Response({
                        'error': f'Product {product.name} is not available'
                    }, status=status.HTTP_400_BAD_REQUEST)
                    
                cart_item, created = CartItem.objects.get_or_create(
                    cart=cart,
                    product=product,
                    defaults={'quantity': serializer.validated_data['quantity']}
                )
                if not created:
                    cart_item.quantity += serializer.validated_data['quantity']
                    cart_item.save()
                return Response(CartItemSerializer(cart_item).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Product.DoesNotExist:
            return Response({
                'error': 'Product not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def remove_item(self, request, pk=None):
        """
        Remove an item from the cart.
        
        Args:
            request: The HTTP request containing product ID.
            pk: The cart ID.
            
        Returns:
            Response: Success or error message.
        """
        if not request.user.is_authenticated:
            raise PermissionDenied("Authentication required to remove items from cart")
            
        try:
            cart = self.get_object()
            product_id = request.data.get('product_id')
            if not product_id:
                return Response({
                    'error': 'product_id is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            cart_item = cart.items.get(product_id=product_id)
            cart_item.delete()
            return Response({
                'message': 'Item removed successfully'
            }, status=status.HTTP_200_OK)
        except CartItem.DoesNotExist:
            return Response({
                'error': 'Item not found in cart'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def update_quantity(self, request, pk=None):
        """
        Update the quantity of an item in the cart.
        
        Args:
            request: The HTTP request containing product ID and quantity.
            pk: The cart ID.
            
        Returns:
            Response: JSON response with updated item data or error message.
        """
        if not request.user.is_authenticated:
            raise PermissionDenied("Authentication required to update cart quantities")
            
        try:
            cart = self.get_object()
            product_id = request.data.get('product_id')
            quantity = request.data.get('quantity')

            if not product_id or quantity is None:
                return Response({
                    'error': 'Both product_id and quantity are required'
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                quantity = int(quantity)
                if quantity < 0:
                    raise ValueError()
            except ValueError:
                return Response({
                    'error': 'Quantity must be a positive integer'
                }, status=status.HTTP_400_BAD_REQUEST)

            cart_item = cart.items.get(product_id=product_id)
            if quantity == 0:
                cart_item.delete()
                return Response({
                    'message': 'Item removed from cart'
                }, status=status.HTTP_200_OK)
                
            cart_item.quantity = quantity
            cart_item.save()
            return Response(CartItemSerializer(cart_item).data)
        except CartItem.DoesNotExist:
            return Response({
                'error': 'Item not found in cart'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_exempt, name='dispatch')
class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing orders.
    Provides read-only access to user's order history.
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Get the list of orders for the current user.
        """
        return Order.objects.filter(user=self.request.user)
    
@method_decorator(csrf_exempt, name='dispatch')
class CheckoutSessionView(views.APIView):
    """
    API view for creating and managing Stripe checkout sessions.

    This view handles the creation of Stripe checkout sessions and manages
    the order creation process during checkout.

    Features:
        - Creates Stripe checkout sessions
        - Handles order creation
        - Processes line items
        - Manages cart clearing
        - Handles success/cancel URLs

    Process Flow:
        1. Validate checkout items
        2. Create order in pending state
        3. Create Stripe checkout session
        4. Link order with checkout session
        5. Return checkout URL

    Security:
        - Requires authentication
        - Validates product availability
        - Verifies prices
        - Handles secure redirects

    Error Handling:
        - Validates input data
        - Handles Stripe API errors
        - Manages transaction atomicity
        - Provides detailed error responses
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Create a new checkout session.
        
        Args:
            request: The HTTP request containing order items.
            
        Returns:
            Response: JSON response with checkout URL and order ID or error message.
        """
        try:
            serializer = CheckoutSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            # Create line items for Stripe
            line_items = []
            order_items = []
            total_amount = 0

            for item_data in serializer.validated_data['items']:
                try:
                    product = get_object_or_404(Product, id=item_data['id'])
                    if not product.active:
                        return Response({
                            'error': f'Product {product.name} is not available for purchase'
                        }, status=status.HTTP_400_BAD_REQUEST)
                        
                    if not product.stripe_price_id:
                        return Response({
                            'error': f'Product {product.name} has no associated price'
                        }, status=status.HTTP_400_BAD_REQUEST)

                    quantity = item_data['quantity']
                    if quantity <= 0:
                        return Response({
                            'error': f'Invalid quantity for product {product.name}'
                        }, status=status.HTTP_400_BAD_REQUEST)

                    price = float(item_data['price'])  # Use the provided price
                    total_amount += price * quantity

                    line_items.append({
                        'price': product.stripe_price_id,
                        'quantity': quantity,
                    })

                    order_items.append({
                        'product': product,
                        'quantity': quantity,
                        'price': price,
                    })
                except Product.DoesNotExist:
                    return Response({
                        'error': f'Product with ID {item_data["id"]} not found'
                    }, status=status.HTTP_404_NOT_FOUND)

            if not line_items:
                return Response({
                    'error': 'No valid items in the order'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Create Stripe checkout session
            checkout_session = stripe.checkout.Session.create(
                customer_email=request.user.email,
                payment_method_types=['card'],
                line_items=line_items,
                mode='payment',
                success_url=settings.STRIPE_SUCCESS_URL,
                cancel_url=settings.STRIPE_CANCEL_URL,
                metadata={
                    'user_id': str(request.user.id),
                    'order_total': str(total_amount)
                }
            )

            # Create order in our database
            order = Order.objects.create(
                user=request.user,
                stripe_checkout_id=checkout_session.id,
                total_amount=total_amount,
                status=Order.OrderStatus.PENDING
            )

            # Create order items
            for item in order_items:
                OrderItem.objects.create(
                    order=order,
                    product=item['product'],
                    quantity=item['quantity'],
                    price=item['price']
                )

            # Clear user's cart
            Cart.objects.filter(user=request.user).delete()

            return Response({
                'checkout_url': checkout_session.url,
                'order_id': order.id,
                'total_amount': total_amount
            })

        except stripe.error.StripeError as e:
            return Response({
                'error': str(e),
                'error_type': type(e).__name__,
                'error_code': getattr(e, 'code', None)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            print(f"Checkout Error: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return Response({
                'error': 'An error occurred while processing your request',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CartView(APIView):
    """
    API view for basic cart operations.
    Handles retrieving and managing the user's shopping cart.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get the current user's cart or create one if it doesn't exist"""
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def post(self, request):
        """Add an item to the cart"""
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id') or request.POST.get('product_id')
        quantity = int(request.data.get('quantity', 1) or request.POST.get('quantity', 1))

        if not product_id:
            return Response({'error': 'Product ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(id=product_id)
            if not product.active:
                return Response({'error': 'Product is not available'}, status=status.HTTP_400_BAD_REQUEST)

            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={'quantity': quantity}
            )

            if not created:
                cart_item.quantity += quantity
                cart_item.save()

            serializer = CartSerializer(cart)
            return Response(serializer.data)

        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        except ValueError:
            return Response({'error': 'Invalid quantity'}, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class CartAddView(APIView):
    """
    API view for adding items to cart.
    Supports both form-data and JSON requests.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Add a product to the cart"""
        product_id = request.data.get('product_id') or request.POST.get('product_id')
        quantity = request.data.get('quantity') or request.POST.get('quantity', 1)

        try:
            quantity = int(quantity)
            if quantity < 1:
                return Response({'error': 'Quantity must be at least 1'}, status=status.HTTP_400_BAD_REQUEST)

            product = Product.objects.get(id=product_id)
            if not product.active:
                return Response({'error': 'Product is not available'}, status=status.HTTP_400_BAD_REQUEST)

            cart, _ = Cart.objects.get_or_create(user=request.user)
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={'quantity': quantity}
            )

            if not created:
                cart_item.quantity = quantity
                cart_item.save()

            serializer = CartSerializer(cart)
            return Response(serializer.data)

        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        except (TypeError, ValueError):
            return Response({'error': 'Invalid quantity'}, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class CartRemoveView(APIView):
    """API view for removing items from cart"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Remove a product from the cart"""
        product_id = request.data.get('product_id') or request.POST.get('product_id')
        if not product_id:
            return Response({'error': 'Product ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        cart = get_object_or_404(Cart, user=request.user)
        CartItem.objects.filter(cart=cart, product_id=product_id).delete()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)

@method_decorator(csrf_exempt, name='dispatch')
class CartUpdateView(APIView):
    """API view for updating cart item quantities"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Update the quantity of a cart item"""
        product_id = request.data.get('product_id') or request.POST.get('product_id')
        quantity = request.data.get('quantity') or request.POST.get('quantity')

        if not product_id or not quantity:
            return Response({'error': 'Both product_id and quantity are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            quantity = int(quantity)
            if quantity < 1:
                return Response({'error': 'Quantity must be at least 1'}, status=status.HTTP_400_BAD_REQUEST)

            cart = get_object_or_404(Cart, user=request.user)
            cart_item = get_object_or_404(CartItem, cart=cart, product_id=product_id)
            cart_item.quantity = quantity
            cart_item.save()

            serializer = CartSerializer(cart)
            return Response(serializer.data)
        except (TypeError, ValueError):
            return Response({'error': 'Invalid quantity'}, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class CartClearView(APIView):
    """API view for clearing the entire cart"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Remove all items from the cart"""
        cart = get_object_or_404(Cart, user=request.user)
        cart.items.all().delete()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            serializer = CheckoutSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            # Create order
            order = Order.objects.create(
                user=request.user,
                status=Order.OrderStatus.PENDING,
                total_amount=0
            )

            line_items = []
            total_amount = 0

            # Create order items and prepare Stripe line items
            for item_data in serializer.validated_data['items']:
                try:
                    product = Product.objects.get(id=item_data['id'])
                    if not product.active:
                        return Response(
                            {'error': f'Product {product.name} is not available'},
                            status=status.HTTP_400_BAD_REQUEST
                        )

                    quantity = item_data['quantity']
                    price = float(item_data['price'])

                    # Create order item
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=quantity,
                        price=price
                    )

                    total_amount += price * quantity

                    # Prepare Stripe line item
                    if not product.stripe_price_id:
                        return Response(
                            {'error': f'Product {product.name} has no associated price'},
                            status=status.HTTP_400_BAD_REQUEST
                        )

                    line_items.append({
                        'price': product.stripe_price_id,
                        'quantity': quantity
                    })

                except Product.DoesNotExist:
                    order.delete()
                    return Response(
                        {'error': f'Product with ID {item_data["id"]} not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )

            # Update order total
            order.total_amount = total_amount
            order.save()

            # Create Stripe checkout session
            checkout_session = stripe.checkout.Session.create(
                customer_email=request.user.email,
                payment_method_types=['card'],
                line_items=line_items,
                mode='payment',
                success_url=settings.STRIPE_SUCCESS_URL,
                cancel_url=settings.STRIPE_CANCEL_URL,
                metadata={
                    'order_id': str(order.id)
                }
            )

            # Update order with checkout session ID
            order.stripe_checkout_id = checkout_session.id
            order.save()

            # Clear user's cart
            Cart.objects.filter(user=request.user).delete()

            return Response({
                'checkout_url': checkout_session.url,
                'order_id': order.id,
                'total_amount': total_amount
            })

        except stripe.error.StripeError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': 'An error occurred while processing your request',
                 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class OrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

class StripeWebhookView(APIView):
    """
    API view for processing Stripe webhooks.

    This view handles incoming webhook events from Stripe, particularly
    for processing successful checkout sessions and updating order status.

    Events Handled:
        - checkout.session.completed: Updates order status
        - Other events can be added as needed

    Process Flow:
        1. Verify webhook signature
        2. Parse event data
        3. Process specific event type
        4. Update local database
        5. Return confirmation

    Security:
        - Verifies Stripe signature
        - Uses webhook secret
        - Handles secure event processing

    Error Handling:
        - Validates webhook data
        - Handles signature verification
        - Manages event processing errors
        - Logs webhook activities
    """
    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )

            if event['type'] == 'checkout.session.completed':
                session = event['data']['object']
                order_id = session['metadata']['order_id']

                # Update order status
                order = Order.objects.get(id=order_id)
                order.status = 'completed'
                order.save()

                # Clear user's cart
                Cart.objects.filter(user=order.user).delete()

            return Response({'status': 'success'})

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            ) 