from rest_framework import viewsets, permissions
from .models import Goal
from .serializers import GoalSerializer

class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Return goals owned by the logged-in user, or all goals for admins.
        """
        user = self.request.user
        if hasattr(user, 'role') and user.role == 'admin':
            return Goal.objects.all().order_by('deadline') # Admins see all
        return Goal.objects.filter(user=user).order_by('deadline')

    def perform_create(self, serializer):
        """Assign the logged-in user when creating a new goal."""
        serializer.save(user=self.request.user)