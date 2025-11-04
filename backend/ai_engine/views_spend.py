import os
import joblib
import numpy as np
import pandas as pd
from decimal import Decimal
from datetime import date

# --- Django & DRF Imports ---
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from django.conf import settings
from transactions.models import Transaction

# --- Helper Function Imports ---
# Import the data preparation function from Day 14
from ai_engine.ai_utils.spend_utils import build_monthly_category_matrix

# --- Constants ---
# Use Django's settings.BASE_DIR to build the path
BASE_DIR = settings.BASE_DIR 
# Path to the models we trained on Day 14
MODELS_DIR = os.path.join(BASE_DIR, 'ai_models', 'spend_models')


# --- Helper Functions (from Day 14) ---

def safe_name(s: str) -> str:
    """Cleans a category name to be a safe filename."""
    return "".join(c if c.isalnum() else "_" for c in s).lower()

def load_global_model(category):
    """
    Loads the correct global model (.pkl file) for a specific category.
    """
    gname = f"global_cat_{safe_name(category)}.pkl"
    gpath = os.path.join(MODELS_DIR, gname)
    
    if os.path.exists(gpath):
        return joblib.load(gpath)
    return None # Return None if no model exists for this category


# --- Existing View (from Day 14) ---
# This view predicts the next month's total spend for ALL categories

class PredictSpendingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Returns predicted next-month expense for each category for the logged-in user.
        """
        user = request.user
        # 1. Get user's historical data
        pivot = build_monthly_category_matrix(user, months_back=12) 
        
        if pivot.empty:
            return Response({'detail': 'No transaction history available'}, status=status.HTTP_400_BAD_REQUEST)

        predictions = []

        # 2. Loop through each category the user has
        for category in pivot.columns:
            series = pivot[category].values  # Get the array of monthly spends
            
            # 3. Try to load the global model for this category
            pkg = load_global_model(category)
            
            if pkg:
                model = pkg.get('model')
                window = pkg.get('window', 3)
                score = pkg.get('score', None)
                
                if len(series) >= window:
                    # Prepare the last 'window' months as features
                    feat = np.array(series[-window:]).reshape(1, -1)
                    try:
                        pred = float(model.predict(feat)[0])
                        predictions.append({
                            'category': category, 
                            'predicted': round(max(0, pred), 2), # Ensure non-negative
                            'model_type': 'global', 
                            'model_score': round(score, 3) if score is not None else None
                        })
                        continue # Go to the next category
                    except Exception:
                        pass # Model failed, fall back to heuristic
            
            # 4. Fallback: If no model or not enough data, use heuristic (avg of last 3)
            last_n = series[-3:]
            avg = float(last_n.mean()) if len(last_n) > 0 else 0.0
            predictions.append({
                'category': category, 
                'predicted': round(avg, 2), 
                'model_type': 'heuristic', 
                'model_score': None
            })

        # 5. Return sorted predictions
        predictions = sorted(predictions, key=lambda x: x['predicted'], reverse=True)
        
        last_month_date = pivot.index[-1].isoformat()
        last_totals = {cat: float(pivot.iloc[-1][cat]) for cat in pivot.columns}

        return Response({
            'predictions': predictions, 
            'last_month': last_month_date, 
            'last_totals': last_totals
        })


# --- NEW View (from Day 15) ---
# This view gets Actuals vs. Predicted for the Top 5 categories

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def spending_trend_and_insights(request):
    """
    Returns actual spending (last 3 months) + predicted next month for
    the user's top 5 categories.
    Also returns AI-driven insights.
    """
    user = request.user
    
    # 1. Get user's spending data
    pivot = build_monthly_category_matrix(user, months_back=12) 
    
    if pivot.empty or len(pivot) < 3:
        # Need at least 3 months of data to show a trend
        return Response({"error": "Not enough data for trends. Add more transactions."}, status=status.HTTP_400_BAD_REQUEST)
        
    # 2. Get top 5 categories based on last 3 months' average spend
    last_3_months_avg = pivot.iloc[-3:].mean().sort_values(ascending=False)
    top_5_categories = last_3_months_avg.head(5).index

    trends = []
    insights = []

    # 3. Loop through top 5 categories and get predictions
    for category in top_5_categories:
        series = pivot[category].values # Full 12-month series
        
        # Get last 3 actual values for the chart
        actuals = series[-3:]
        
        # Load the correct Day 14 model (e.g., global_cat_groceries.pkl)
        pkg = load_global_model(category)
        
        predicted_amount = 0.0
        
        if pkg:
            model = pkg.get('model')
            window = pkg.get('window', 3) # This is the 3-month lag feature
            
            # Ensure we have enough data to form a feature vector
            if len(series) >= window:
                # Use the last 'window' months of spending as features
                features = np.array(series[-window:]).reshape(1, -1)
                try:
                    # Predict next month's spending
                    predicted_amount = float(model.predict(features)[0])
                    predicted_amount = max(0, predicted_amount) # Ensure non-negative
                except Exception as e:
                    print(f"Prediction failed for {category}: {e}")
                    predicted_amount = float(actuals.mean()) # Fallback
            else:
                 predicted_amount = float(actuals.mean()) # Fallback
        else:
            # Fallback heuristic: average of last 3 months if no model
            predicted_amount = float(actuals.mean())
        
        # 4. Generate Insights
        avg_recent = float(actuals.mean())
        # Prevent division by zero if avg_recent is 0
        change_pct = ((predicted_amount - avg_recent) / avg_recent * 100) if avg_recent > 0 else 0
        
        status = "stable"
        if change_pct > 15: status = "overspend"  # Predicted spend is >15% higher than avg
        if change_pct < -15: status = "saving"    # Predicted spend is >15% lower than avg

        insights.append({
            "category": category,
            "predicted": round(predicted_amount, 2),
            "avg_recent": round(avg_recent, 2),
            "change_percent": round(change_pct, 1),
            "status": status
        })

        # 5. Format data for the line chart
        # We need a "long" format: {month, category, amount, type}
        month_labels = ["M-2", "M-1", "Last Month"] # Labels for last 3 months
        for i in range(3):
            trends.append({
                "month": month_labels[i],
                "category": category,
                "amount": float(actuals[i]),
                "type": "Actual"
            })
        # Add the predicted data point for the "Next Month"
        trends.append({
            "month": "Next Month",
            "category": category,
            "amount": round(predicted_amount, 2),
            "type": "Predicted"
        })

    return Response({
        "trends": trends,       # For the line chart
        "insights": insights    # For the insights list
    })
