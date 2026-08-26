from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import JobApplicationViewSet, RegisterView, ProfileView
from .views import ForgotPasswordView, ResetPasswordView
from .views import ChangePasswordView
from .views import DeleteAccountView
from .views import UpdateNameView

router = DefaultRouter()
router.register(r'applications', JobApplicationViewSet, basename='application')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('login/refresh/', TokenRefreshView.as_view(), name='login-refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/<uid>/<token>/', ResetPasswordView.as_view(), name='reset-password'),
    path('delete-account/', DeleteAccountView.as_view(), name='delete-account'),
    path('profile/update-name/', UpdateNameView.as_view(), name='update-name'),
] + router.urls