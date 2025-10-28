# backend/insights/views.py
import os
import joblib
import numpy as np
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.conf import settings
from decimal import Decimal

from insights.utils import build_monthly_agg_for_user

# Define path to saved models
BASE_DIR = settings.BASE_DIR # Using Django's settings BASE_DIR
MODELS_DIR = os.path.join(BASE_DIR, 'insights_models')

def load_model_for_user(user):
    """Loads the user-specific model, falling back to the global model."""
    user_model_path = os.path.join(MODELS_DIR, f'user_{user.id}_rf.pkl')
    global_model_path = os.path.join(MODELS_DIR, 'global_rf.pkl')

    if os.path.exists(user_model_path):
        print(f"Loading model for user {user.id}")
        return joblib.load(user_model_path), 'user'
    elif os.path.exists(global_model_path):
        print(f"Loading global model for user {user.id}")
        return joblib.load(global_model_path), 'global'
    else:
        print(f"No model found for user {user.id} or globally.")
        return None, None

def prepare_feature_for_prediction(expense_series, window):
    """Prepares the feature vector needed for prediction."""
    vals = np.array(expense_series[-window:], dtype=float) # Last 'window' values
    if len(vals) < window:
         return None # Not enough data
    features = list(vals) + [np.mean(vals), np.std(vals)]
    return np.array(features).reshape(1, -1) # Reshape for single prediction

class PredictMonthlyExpenseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Predicts next month's expense and savings based on historical data.
        """
        user = request.user
        model_pkg, model_type = load_model_for_user(user)

        if model_pkg is None:
            return Response({'detail': 'Prediction model not available for this user.'}, status=404)

        model = model_pkg['model']
        window = model_pkg.get('window', 3)
        score = model_pkg.get('score', None)

        # Get historical data (need at least 'window' months for features)
        df = build_monthly_agg_for_user(user, months_back=window + 1)
        expenses = df['expense'].values

        if len(expenses) < window:
            return Response({'detail': f'Not enough historical expense data ({len(expenses)} months) to predict.'}, status=400)

        # Prepare features from the most recent data
        features = prepare_feature_for_prediction(expenses, window)
        if features is None:
             return Response({'detail': 'Could not prepare features for prediction.'}, status=400)

        # --- Make Prediction ---
        predicted_expense = float(model.predict(features)[0])
        # Ensure prediction is non-negative
        predicted_expense = max(0, predicted_expense)

        # --- Predict Income (Simple Heuristic: Average of last 3 months) ---
        incomes = df['income'].values
        if len(incomes) >= 3:
            predicted_income = float(np.mean(incomes[-3:]))
        elif len(incomes) > 0:
             predicted_income = float(np.mean(incomes))
        else:
             predicted_income = 0.0

        predicted_savings = predicted_income - predicted_expense

        return Response({
            'predicted_expense': round(predicted_expense, 2),
            'predicted_income': round(predicted_income, 2),
            'predicted_savings': round(predicted_savings, 2),
            'model_score': round(score, 3) if score is not None else None,
            'model_type': model_type
        })