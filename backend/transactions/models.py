from django.db import models
from users.models import User

class Transaction(models.Model):
    TRANSACTION_TYPE = (
        ('income', 'Income'),
        ('expense', 'Expense'),
    )

    # Add db_index=True to the fields you filter on
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    title = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(max_length=10, choices=TRANSACTION_TYPE, db_index=True)
    category = models.CharField(max_length=50)
    # Your date field might be 'auto_now_add=True' or 'default=timezone.now'
    # Either way, add db_index=True
    date = models.DateField(auto_now_add=True, db_index=True)

    def __str__(self):
        return f"{self.title} - {self.amount}"
