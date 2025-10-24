from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Import your views
from users.views import UserViewSet, RegisterView
from transactions.views import TransactionViewSet
from budgets.views import BudgetViewSet
from goals.views import GoalViewSet

# Import the simplejwt views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
# Add the 'basename' argument to each viewset that uses 'get_queryset'
router.register(r'users', UserViewSet, basename='user')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'goals', GoalViewSet, basename='goal')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Your API routes from Day 3
    path('api/', include(router.urls)),

    # Auth routes
    path('api/register/', RegisterView.as_view(), name='auth_register'),
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]