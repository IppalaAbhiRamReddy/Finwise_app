from rest_framework import serializers
from .models import Budget

class BudgetSerializer(serializers.ModelSerializer):
    """
    Serializes Budget model instances. Includes the username read-only.
    """
    # Define username explicitly here
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Budget
        # List model fields AND explicitly declared fields here
        fields = ['id', 'user', 'username', 'category', 'limit', 'start_date', 'end_date', 'created_at']
        # Specify fields that are read-only during input
        read_only_fields = ['id', 'user', 'username', 'created_at']

    # Optional Validation
    def validate(self, data):
        if 'start_date' in data and 'end_date' in data and data['start_date'] > data['end_date']:
            raise serializers.ValidationError("Validation Error: Start date must be before or the same as end date.")
        if 'limit' in data and float(data['limit']) <= 0:
            raise serializers.ValidationError("Validation Error: Budget limit must be positive.")
        return data