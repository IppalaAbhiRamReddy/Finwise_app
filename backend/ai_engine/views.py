from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .serializers import CategorizeRequestSerializer
from ai_engine.ai_utils.transaction_categorizer import predict

class CategorizeTransactionView(APIView):
    """
    API Endpoint to categorize a transaction description.
    POST { "description": "Starbucks coffee" }
    Returns { "category": "Food & Beverage", "confidence": 0.95, ... }
    """
    permission_classes = [permissions.IsAuthenticated]  # Only logged-in users

    def post(self, request):
        serializer = CategorizeRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        description = serializer.validated_data['description']
        
        # Call the predict function from our utility file
        result = predict(description)
        
        return Response(result)