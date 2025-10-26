from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # --- ADD THESE LINES ---
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('user', 'User'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    # --- END OF ADDITION ---

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    income = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return self.username