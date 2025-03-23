# apps/users/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

class UserAdmin(BaseUserAdmin):
    """
    Custom admin interface for the User model.
    
    Provides a customized admin interface for managing users with:
    - List display showing key user information
    - Filtering options for staff and active status
    - Organized field sets for user details
    - Search functionality across multiple fields
    
    Attributes:
        model (User): The User model to administer
        list_display (tuple): Fields to display in the list view
        list_filter (tuple): Fields to filter by in the list view
        fieldsets (tuple): Organized field sets for the detail view
        add_fieldsets (tuple): Fields to show when adding a new user
        search_fields (tuple): Fields to search in
        ordering (tuple): Default ordering for the list view
    """
    model = User
    list_display = ('email', 'username', 'phone', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active')
    fieldsets = (
        (None, {'fields': ('email', 'username', 'phone', 'password')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'phone', 'password1', 'password2', 'is_staff', 'is_active')}
         ),
    )
    search_fields = ('email', 'username', 'phone')
    ordering = ('email',)

admin.site.register(User, UserAdmin)
