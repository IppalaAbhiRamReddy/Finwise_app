from django.db import models
from users.models import User
from django.utils import timezone

class Transaction(models.Model):
    TRANSACTION_TYPE = (
        ('income', 'Income'),
        ('expense', 'Expense'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    title = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(max_length=10, choices=TRANSACTION_TYPE, db_index=True)
    category = models.CharField(max_length=50)

    # Allow users to set transaction date; default to today
    date = models.DateField(default=timezone.now, db_index=True)

    def __str__(self):
        return f"{self.title} - {self.amount}"
