from rest_framework import viewsets, permissions # <-- Import permissions
from .models import Transaction
from .serializers import TransactionSerializer

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated] # <-- 1. Add this line

    # --- 2. Add this function ---
    # This ensures a user only sees their own transactions
    def get_queryset(self):
        return self.request.user.transaction_set.all()

    # --- 3. Add this function ---
    # This automatically assigns the logged-in user to the new transaction
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)