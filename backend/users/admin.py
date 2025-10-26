from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# Create a custom admin class to show the 'role' field
class CustomUserAdmin(UserAdmin):
    model = User
    # Add 'role' to the list display and the editable fields
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'role')
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role', 'phone', 'income')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('role', 'phone', 'income')}),
    )

# Register your User model with this custom class
admin.site.register(User, CustomUserAdmin)