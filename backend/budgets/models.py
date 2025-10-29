from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL  # Gets your custom 'users.User'

class Budget(models.Model):
    # Link to the user who owns this budget
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    category = models.CharField(max_length=100)
    limit = models.DecimalField(max_digits=12, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True) # Automatically set when created

    class Meta:
        ordering = ['-start_date'] # Show newest budgets first by default

    def __str__(self):
        return f"{self.user.username} - {self.category} ({self.start_date} to {self.end_date})"