from rest_framework import serializers
from .models import Goal

class GoalSerializer(serializers.ModelSerializer):
    """
    Serializes Goal model instances. Includes username (read-only)
    and calculated progress percentage.
    """
    # Define progress explicitly here
    progress = serializers.SerializerMethodField(read_only=True)
    # Define username explicitly here
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Goal
        # List model fields AND explicitly declared fields here
        fields = ['id', 'user', 'username', 'name', 'target_amount', 'saved_amount', 'deadline', 'completed', 'progress', 'created_at']
        
        # Specify fields that are read-only during input
        read_only_fields = ['id', 'user', 'username', 'progress', 'created_at']

    def get_progress(self, obj):
        """ Calculates the goal completion progress percentage. """
        try:
            target = float(obj.target_amount)
            if target == 0: return 0.00
            saved = float(obj.saved_amount)
            percentage = (saved / target) * 100
            return round(max(0.0, min(100.0, percentage)), 2)
        except (TypeError, ValueError):
            return 0.00

    # Optional Validation
    def validate(self, data):
        if 'target_amount' in data and float(data['target_amount']) <= 0:
            raise serializers.ValidationError("Validation Error: Target amount must be positive.")
        if 'saved_amount' in data and float(data['saved_amount']) < 0:
             raise serializers.ValidationError("Validation Error: Saved amount cannot be negative.")
        return data