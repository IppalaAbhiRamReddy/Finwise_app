# backend/insights/urls.py
from django.urls import path
from .views import PredictMonthlyExpenseView

urlpatterns = [
    path('predict-monthly/', PredictMonthlyExpenseView.as_view(), name='predict-monthly'),
    # Add the optional retrain URL if you implemented it
]