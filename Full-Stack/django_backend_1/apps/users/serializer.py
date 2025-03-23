from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    
    Fields:
        email (str): User's email address
        username (str): User's username
        phone (str): User's phone number
        password (str): User's password (write-only)
        first_name (str): User's first name
        last_name (str): User's last name
    """
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'phone', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        # Use your custom manager to create the user
        user = User.objects.create_user(**validated_data)
        return user

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.
    
    Fields:
        id (UUID): Unique identifier for the user
        email (str): User's email address
        username (str): User's username
        phone (str): User's phone number
        first_name (str): User's first name
        last_name (str): User's last name
        is_verified (bool): Whether the user's email is verified
        date_joined (datetime): When the user joined
        last_login (datetime): User's last login timestamp
    """
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'phone', 'first_name', 'last_name', 
                 'is_verified', 'date_joined', 'last_login')
        read_only_fields = ('id', 'date_joined', 'last_login')

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer that includes user data.
    
    Fields:
        access (str): JWT access token
        refresh (str): JWT refresh token
        user (dict): Serialized user data including:
            - id
            - email
            - username
            - phone
            - first_name
            - last_name
            - is_verified
            - date_joined
            - last_login
    """
    user = UserSerializer(read_only=True)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims as needed (e.g., include the user's email)
        token['email'] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data
