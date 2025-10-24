from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# This will add your custom user to the admin
admin.site.register(User, UserAdmin)