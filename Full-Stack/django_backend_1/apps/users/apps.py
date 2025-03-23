from django.apps import AppConfig


class UsersConfig(AppConfig):
    """
    Application configuration for the users app.
    
    This class configures the users application with:
    - Default auto field for model primary keys
    - Application name for database tables and URL namespacing
    
    Attributes:
        default_auto_field (str): The default field type for primary keys
        name (str): The name of the application
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'
