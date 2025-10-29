from rest_framework import viewsets, permissions
from .models import Budget
from .serializers import BudgetSerializer
from users.models import User

class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated] # Only logged-in users

    def get_queryset(self):
        """
        This view should return a list of all the budgets
        for the currently authenticated user.
        Optionally allows admins to see all budgets.
        """
        user = self.request.user
        # Check the 'role' field we added on Day 7
        if hasattr(user, 'role') and user.role == 'admin':
            return Budget.objects.all().order_by('-start_date') # Admins see all
        # Normal users only see their own
        return Budget.objects.filter(user=user).order_by('-start_date')

    def perform_create(self, serializer):
        """Ensure the budget is saved with the logged-in user."""
        serializer.save(user=self.request.user)