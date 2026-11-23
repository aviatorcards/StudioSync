from django.urls import re_path

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

from apps.core.auth_cookies import REFRESH_COOKIE, enforce_csrf, set_auth_cookies, wants_token_body

from .serializers import ApprovedTokenRefreshSerializer, CustomTokenObtainPairSerializer
from .views import (
    LoginRateThrottle,
    LogoutView,
    MeView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RefreshRateThrottle,
    RegisterView,
)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [LoginRateThrottle]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code != 200:
            return response
        access = response.data.get("access")
        refresh = response.data.get("refresh")
        set_auth_cookies(response, request, access, refresh)
        if not wants_token_body(request):
            response.data = {"detail": "Authenticated"}
        return response


class CookieTokenRefreshView(TokenRefreshView):
    serializer_class = ApprovedTokenRefreshSerializer
    throttle_classes = [RefreshRateThrottle]
    authentication_classes = []
    permission_classes = []

    def post(self, request, *args, **kwargs):
        if not request.data.get("refresh") and request.COOKIES.get(REFRESH_COOKIE):
            enforce_csrf(request)
            data = request.data.copy()
            data["refresh"] = request.COOKIES.get(REFRESH_COOKIE)
            request._full_data = data
        response = super().post(request, *args, **kwargs)
        if response.status_code != 200:
            return response
        access = response.data.get("access")
        refresh = response.data.get("refresh")
        set_auth_cookies(response, request, access, refresh)
        if not wants_token_body(request):
            response.data = {"detail": "Refreshed"}
        return response


urlpatterns = [
    re_path(r"^register/?$", RegisterView.as_view(), name="register"),
    re_path(r"^token/?$", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    re_path(r"^token/refresh/?$", CookieTokenRefreshView.as_view(), name="token_refresh"),
    re_path(r"^token/verify/?$", TokenVerifyView.as_view(), name="token_verify"),
    re_path(r"^logout/?$", LogoutView.as_view(), name="logout"),
    re_path(r"^me/?$", MeView.as_view(), name="user_me"),
    re_path(r"^password/reset/?$", PasswordResetRequestView.as_view(), name="password_reset"),
    re_path(
        r"^password/reset/confirm/?$",
        PasswordResetConfirmView.as_view(),
        name="password_reset_confirm",
    ),
]
