from rest_framework import serializers

class MonthlyPointSerializer(serializers.Serializer):
    """
    Serializes a single data point for the monthly trend chart.
    This isn't tied to a model, it just defines the shape of the output JSON.
    """
    month = serializers.DateField()
    income = serializers.DecimalField(max_digits=14, decimal_places=2)
    expense = serializers.DecimalField(max_digits=14, decimal_places=2)

class CategoryPointSerializer(serializers.Serializer):
    """
    Serializes a single data point for the category pie chart.
    Defines the shape of the output JSON for category totals.
    """
    category = serializers.CharField()
    total = serializers.DecimalField(max_digits=14, decimal_places=2)

class SavingsVsExpenseSerializer(serializers.Serializer):
    """
    Serializes the three main summary cards.
    Defines the shape of the output JSON for the user's overall financial summary.
    """
    total_income = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_expense = serializers.DecimalField(max_digits=14, decimal_places=2)
    savings = serializers.DecimalField(max_digits=14, decimal_places=2)