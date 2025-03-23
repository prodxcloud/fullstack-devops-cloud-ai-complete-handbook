import requests
from rest_framework import viewsets, generics, permissions, status
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib import messages
from django.conf import settings
from .forms import LoginForm
from django.urls import reverse_lazy
from django.views.generic.edit import FormView
from rest_framework.response import Response
from rest_framework.views import APIView
from django.views.generic import TemplateView
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.db import transaction

from .serializer import UserSerializer, UserRegistrationSerializer, MyTokenObtainPairSerializer
User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing users.
    
    Provides CRUD operations for user management with:
    - List all users (GET /users/)
    - Create new user (POST /users/)
    - Retrieve user (GET /users/{id}/)
    - Update user (PUT/PATCH /users/{id}/)
    - Delete user (DELETE /users/{id}/)
    
    Only accessible by staff members.
    
    Attributes:
        queryset (QuerySet): The set of users to manage
        serializer_class (Serializer): The serializer to use for user data
        permission_classes (tuple): Permissions required to access this viewset
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class UserRegistrationView(APIView):
    """
    API endpoint for user registration.
    
    Handles new user registration with:
    - POST /auth/register/
    - Validates user data
    - Creates new user account
    - Returns user data and tokens
    
    Attributes:
        permission_classes (tuple): Permissions required to access this view
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """
        Handle user registration request.
        
        Args:
            request (Request): The HTTP request containing user registration data
            
        Returns:
            Response: JSON response with user data and tokens
        """
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = MyTokenObtainPairSerializer.get_token(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MyTokenObtainPairView(TokenObtainPairView):
    """
    Custom token obtain pair view.
    
    Extends the default JWT token view to include user data in the response.
    - POST /auth/login/
    - Returns access and refresh tokens with user data
    
    Attributes:
        serializer_class (Serializer): The serializer to use for token generation
    """
    serializer_class = MyTokenObtainPairSerializer

class CurrentUserView(APIView):
    """
    API endpoint for current user profile.
    
    Provides profile management with:
    - GET /auth/profile/ - Retrieve current user profile
    - PUT /auth/profile/ - Update current user profile
    
    Requires authentication.
    
    Attributes:
        permission_classes (tuple): Permissions required to access this view
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Retrieve current user profile.
        
        Args:
            request (Request): The HTTP request
            
        Returns:
            Response: JSON response with user profile data
        """
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        """
        Update current user profile.
        
        Args:
            request (Request): The HTTP request containing updated user data
            
        Returns:
            Response: JSON response with updated user profile data
        """
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLoginTemplateView(TemplateView):
    """
    Template-based login view.
    
    Provides a web interface for user login at:
    - GET /auth/login/template/
    
    Renders a login form template.
    
    Attributes:
        template_name (str): The template to render
    """
    template_name = 'users/login.html'

    def form_valid(self, form):
        email = form.cleaned_data.get('email')
        password = form.cleaned_data.get('password')
        login_url = "http://127.0.0.1:8585/api/v1/auth/login/"
        payload = {
            "email": email,
            "password": password
        }
        response = requests.post(login_url, json=payload)
        if response.status_code == 200:
            tokens = response.json()
            self.request.session['access_token'] = tokens.get('access')
            self.request.session['refresh_token'] = tokens.get('refresh')
            messages.success(self.request, "Logged in successfully!")
            return super().form_valid(form)
        else:
            messages.error(self.request, "Invalid credentials. Please try again.")
            return self.form_invalid(form)

class GoogleAuthView(APIView):
    """
    API endpoint for Google OAuth2 authentication.
    
    Handles Google Sign-In with:
    - POST /auth/google/
    - Validates Google ID token
    - Creates/updates user account
    - Returns user data and tokens
    
    Attributes:
        permission_classes (tuple): Permissions required to access this view
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """
        Handle Google authentication request.
        
        Args:
            request (Request): The HTTP request containing Google ID token
            
        Returns:
            Response: JSON response with user data and tokens
        """
        try:
            id_token_str = request.data.get('credential')
            if not id_token_str:
                return Response(
                    {'error': 'ID token is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Verify the ID token
            try:
                idinfo = id_token.verify_oauth2_token(
                    id_token_str,
                    google_requests.Request(),
                    settings.GOOGLE_OAUTH2_CLIENT_ID
                )

                email = idinfo.get('email')
                if not email:
                    return Response(
                        {'error': 'Email not found in ID token'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Create or update user
                with transaction.atomic():
                    user = User.objects.filter(email=email).first()
                    if not user:
                        user = User.objects.create_user(
                            email=email,
                            username=email,
                            first_name=idinfo.get('given_name', ''),
                            last_name=idinfo.get('family_name', ''),
                            password=None  # Password not needed for OAuth users
                        )
                        user.is_active = True
                        if hasattr(user, 'picture'):
                            user.picture = idinfo.get('picture')
                        if hasattr(user, 'google_id'):
                            user.google_id = idinfo.get('sub')  # Google's unique user ID
                        user.save()
                    else:
                        user.first_name = idinfo.get('given_name', user.first_name)
                        user.last_name = idinfo.get('family_name', user.last_name)
                        if hasattr(user, 'picture'):
                            user.picture = idinfo.get('picture')
                        if hasattr(user, 'google_id'):
                            user.google_id = idinfo.get('sub')
                        user.save()

                # Generate JWT tokens
                refresh = MyTokenObtainPairSerializer.get_token(user)
                
                return Response({
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': {
                        'id': user.id,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'picture': idinfo.get('picture'),
                        'date_joined': user.date_joined,
                        'last_login': user.last_login
                    }
                })

            except ValueError:
                return Response(
                    {'error': 'Invalid ID token'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )