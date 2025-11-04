from rest_framework import serializers

class CategorizeRequestSerializer(serializers.Serializer):
    """ Validates the incoming request data. """
    description = serializers.CharField(max_length=500, required=True, allow_blank=False)

class CategorizeResponseSerializer(serializers.Serializer):
    """ Defines the shape of the successful response. """
    category = serializers.CharField(allow_null=True)
    confidence = serializers.FloatField()
    candidates = serializers.ListField(child=serializers.ListField(), allow_empty=True)