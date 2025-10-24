from django.contrib import admin
from .models import Transaction

# This will add the Transaction model
admin.site.register(Transaction)