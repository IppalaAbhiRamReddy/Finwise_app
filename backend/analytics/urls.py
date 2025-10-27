from django.urls import path
from .views import MonthlySpendingView, CategorySpendingView, SavingsVsExpenseView

# These URLs will be prefixed with '/api/analytics/' by the main urls.py
urlpatterns = [
    path('monthly-spending/', MonthlySpendingView.as_view(), name='monthly-spending'),
    path('category-spending/', CategorySpendingView.as_view(), name='category-spending'),
    path('savings-vs-expense/', SavingsVsExpenseView.as_view(), name='savings-vs-expense'),
]