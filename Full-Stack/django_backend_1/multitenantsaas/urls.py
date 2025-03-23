from django.contrib import admin
from django.urls import include, path, re_path
from django.conf.urls.static import static
from django.conf import settings
from django.views.generic.base import RedirectView
# DRF and SimpleJWT
from rest_framework import routers, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework_simplejwt.views import TokenRefreshView
# Swagger / drf-yasg
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
# Apps URLs
from apps.snippets import urls as snippets_urls
from apps.finances import urls as finances_urls
from apps.users import urls as users_urls
# Ecommerce and Stripe Online payment
from apps.products import urls as products_urls
from apps.payments import urls as payment_urls
# Import viewsets for router registration
from apps.snippets.views import SnippetsViewSet
from apps.finances.views import AccountViewSet, TransactionViewSet, CategoryViewSet
from apps.users.views import UserViewSet
from apps.products.views import ProductViewSet, CartViewSet, OrderViewSet

schema_view = get_schema_view(
    openapi.Info(
        title="prodxcloud.io Multi-tenant SaaS",
        default_version='v1',
        description="Microservices built by prodxcloud",
        terms_of_service="https://prodxcloud.io/policies/terms/",
        contact=openapi.Contact(email="joel.wembo@prodxcloud.com"),
        license=openapi.License(name="Commercial License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

# Setup a router for viewsets
router = routers.DefaultRouter()
router.register(r'snippets', SnippetsViewSet, basename="snippet")
router.register(r'accounts', AccountViewSet, basename="account")
router.register(r'transactions', TransactionViewSet, basename="transaction")
router.register(r'categories', CategoryViewSet, basename="category")
router.register(r'users', UserViewSet, basename="user")
router.register(r'products', ProductViewSet, basename="product")
router.register(r'carts', CartViewSet, basename="cart")
router.register(r'orders', OrderViewSet, basename="order")

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request, format=None):
    """
    API root view that lists all available endpoints
    """
    return Response({
        'snippets': reverse('snippet-list', request=request, format=format),
        'accounts': reverse('account-list', request=request, format=format),
        'transactions': reverse('transaction-list', request=request, format=format),
        'categories': reverse('category-list', request=request, format=format),
        'users': reverse('user-list', request=request, format=format),
        'products': reverse('product-list', request=request, format=format),
        'carts': reverse('cart-list', request=request, format=format),
        'orders': reverse('order-list', request=request, format=format),
        'payments': reverse('payment-list', request=request, format=format),
        'crypto': reverse('crypto-list', request=request, format=format),
    })

urlpatterns = [
    # Admin and API documentation URLs
    path('admin/', admin.site.urls),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    
    # Redirect root to API documentation
    path('', RedirectView.as_view(url='/redoc/', permanent=False)),
    
    # API endpoints
    path('api/v1/', include(router.urls)),  # Include router URLs first
    path('api/v1/', api_root, name='api-root'),
    path('api/v1/auth/', include(users_urls)),
    path('api/v1/store/', include(products_urls)),
    path('api/v1/payments/', include(payment_urls)),
    path('api/v1/finances/', include(finances_urls)),
    path('api/v1/snippets/', include(snippets_urls)),
]

# Add debug toolbar URLs in development
if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns
    # Add static and media URLs
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
