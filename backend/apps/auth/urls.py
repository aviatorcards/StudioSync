from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from django.urls import path, re_path
from .views import MeView, PasswordResetRequestView, PasswordResetConfirmView, RegisterView

urlpatterns = [
    re_path(r'^register/?$', RegisterView.as_view(), name='register'),
    re_path(r'^token/?$', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    re_path(r'^token/refresh/?$', TokenRefreshView.as_view(), name='token_refresh'),
    re_path(r'^token/verify/?$', TokenVerifyView.as_view(), name='token_verify'),
    re_path(r'^me/?$', MeView.as_view(), name='user_me'),
    re_path(r'^password/reset/?$', PasswordResetRequestView.as_view(), name='password_reset'),
    re_path(r'^password/reset/confirm/?$', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]
