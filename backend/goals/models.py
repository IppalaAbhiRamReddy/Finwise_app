from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Goal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals')
    name = models.CharField(max_length=150)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    # Allow tracking how much has been saved towards the goal
    saved_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    deadline = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False) # Track if the goal is met

    class Meta:
        ordering = ['deadline'] # Order goals by deadline by default

    def __str__(self):
        return f"{self.user.username} - {self.name}"