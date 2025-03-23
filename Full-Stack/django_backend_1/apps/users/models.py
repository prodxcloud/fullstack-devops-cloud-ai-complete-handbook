import uuid
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class CustomUserManager(BaseUserManager):
    """
    Custom user manager for handling user creation.
    
    This manager provides methods for creating regular users and superusers,
    with email-based authentication and optional phone number.
    """
    
    def create_user(self, email, phone=None, password=None, **extra_fields):
        """
        Create and save a regular user with the given email and password.
        
        Args:
            email (str): The user's email address
            phone (str, optional): The user's phone number
            password (str, optional): The user's password
            **extra_fields: Additional fields to set on the user
            
        Returns:
            User: The created user instance
            
        Raises:
            ValueError: If email and phone are both empty
        """
        if not email and not phone:
            raise ValueError('Required fields cannot be empty')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, phone=None, password=None, **extra_fields):
        """
        Create and save a superuser with the given email and password.
        
        Args:
            email (str): The superuser's email address
            phone (str, optional): The superuser's phone number
            password (str, optional): The superuser's password
            **extra_fields: Additional fields to set on the superuser
            
        Returns:
            User: The created superuser instance
            
        Raises:
            ValueError: If is_staff or is_superuser is not True
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email=email, password=password, **extra_fields)


class User(AbstractUser):
    """
    Custom User model that uses email for authentication.
    
    This model extends Django's AbstractUser to provide:
    - UUID as primary key
    - Email-based authentication
    - Optional phone number
    - Email verification status
    - OTP secret for two-factor authentication
    
    Attributes:
        id (UUIDField): Unique identifier for the user
        email (EmailField): User's email address
        phone (CharField): User's phone number
        last_otp_secret (CharField): Secret for OTP generation
        is_verified (BooleanField): Email verification status
        first_name (CharField): User's first name
        last_name (CharField): User's last name
        username (CharField): User's username
        date_joined (DateTimeField): When the user joined
        last_login (DateTimeField): Last login timestamp
    """
    id = models.UUIDField(
        primary_key=True, unique=True, default=uuid.uuid4, editable=False
    )
    email = models.EmailField(unique=True, null=True, blank=True)
    phone = models.CharField(max_length=15, unique=True, null=True, blank=True)
    last_otp_secret = models.CharField(
        max_length=32,
        default="DEFAULT_SECRET"
    )
    is_verified = models.BooleanField(
        default=False,
        help_text="Indicates whether the user's email has been verified"
    )

    # Use email as the unique identifier for authentication
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = CustomUserManager()

    def __str__(self):
        """
        Return a string representation of the user.
        
        Returns:
            str: The user's email, phone, or username
        """
        return self.email or self.phone or self.username

    def save(self, *args, **kwargs):
        """
        Save the user instance.
        
        If first_name is not provided, it will be set to username or email.
        
        Args:
            *args: Variable length argument list
            **kwargs: Arbitrary keyword arguments
        """
        # If first_name is not provided, use username or email as fallback.
        if not self.first_name:
            if self.username:
                self.first_name = self.username
            elif self.email:
                self.first_name = self.email
        super().save(*args, **kwargs)
