from rest_framework import viewsets, permissions # <-- Import permissions
from .models import Goal
from .serializers import GoalSerializer

class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated] # <-- 1. Add this line

    # --- 2. Add this function ---
    def get_queryset(self):
        return self.request.user.goal_set.all()

    # --- 3. Add this function ---
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)