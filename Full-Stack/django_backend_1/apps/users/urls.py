from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import UserViewSet, UserRegistrationView, MyTokenObtainPairView, CurrentUserView, UserLoginTemplateView, GoogleAuthView

# Create a router and register the UserViewSet
router = DefaultRouter()
router.register(r'users', UserViewSet)

# Define URL patterns for user authentication and management
urlpatterns = [
    # User registration endpoint
    path('register/', UserRegistrationView.as_view(), name='user-registration'),
    
    # JWT token endpoints
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User profile endpoints
    path('profile/', CurrentUserView.as_view(), name='current_user'),
    
    # Template-based login view
    path('login/template/', UserLoginTemplateView.as_view(), name='login-template'),
    
    # Google authentication endpoint
    path('google/', GoogleAuthView.as_view(), name='google-auth'),
    
    # Include all router URLs
    path('', include(router.urls)),
]
