from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.urls import path, include # Make sure 'include' is imported

# Import all your views
from users.views import UserViewSet, RegisterView, CustomTokenObtainPairView
from transactions.views import TransactionViewSet
from budgets.views import BudgetViewSet
from goals.views import GoalViewSet

# Import only the 'refresh' view from simplejwt
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
# We add 'basename' because we are using 'get_queryset' in our views
router.register(r'users', UserViewSet, basename='user')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'goals', GoalViewSet, basename='goal')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # All your /api/transactions/, /api/users/, etc.
    path('api/', include(router.urls)),
    
    # Auth-specific routes
    path('api/register/', RegisterView.as_view(), name='auth_register'),
    path('api/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

urlpatterns = [
    path('admin/', admin.site.urls),

    # All your /api/transactions/, /api/users/, etc.
    path('api/', include(router.urls)),

    # Auth-specific routes
    path('api/register/', RegisterView.as_view(), name='auth_register'),
    path('api/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # --- ADD THIS LINE ---
    # Plugs in all the URLs from the 'analytics' app
    path('api/analytics/', include('analytics.urls')),
]