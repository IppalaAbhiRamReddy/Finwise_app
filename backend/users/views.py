from rest_framework import viewsets, permissions, generics
from .models import User
from .serializers import UserSerializer, RegisterSerializer  # <-- Import RegisterSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer  # <-- Import CustomTokenObtainPairSerializer

# --- ADD THIS NEW VIEW ---
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,) # <-- Anyone can register
    serializer_class = RegisterSerializer


# Your existing UserViewSet
# Let's lock this down so only admins can see all users
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser] # <-- Only admins

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer