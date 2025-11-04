from django.urls import path
from .views import CategorizeTransactionView # Existing
from .views_spend import PredictSpendingView, spending_trend_and_insights # <-- 1. Import new view

urlpatterns = [
    path('categorize-transaction/', CategorizeTransactionView.as_view(), name='categorize-transaction'),
    path('predict-spending/', PredictSpendingView.as_view(), name='predict-spending'),
    path('spending-trend/', spending_trend_and_insights, name='spending-trend'), # <-- 2. Add new path
]