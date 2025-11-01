from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    """
    Serializes Transaction model instances. Includes the related user's username (read-only).
    """
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Transaction
        fields = ['id', 'user', 'username', 'title', 'amount', 'type', 'category', 'date']
        read_only_fields = ['id', 'user', 'username']

    def validate_amount(self, value):
        """
        Ensure the amount is a positive number.
        """
        try:
            if float(value) <= 0:
                raise serializers.ValidationError("Amount must be positive.")
        except (TypeError, ValueError):
            raise serializers.ValidationError("Invalid amount value.")
        return value
