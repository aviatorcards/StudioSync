from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.authentication import GENERIC_AUTH_DETAIL

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.is_active or not self.user.is_approved:
            raise AuthenticationFailed(GENERIC_AUTH_DETAIL, code="no_active_account")
        return data


class ApprovedTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        raw = attrs.get("refresh")
        try:
            token = RefreshToken(raw)
            user = User.objects.get(id=token.get("user_id"))
        except Exception as exc:
            raise AuthenticationFailed(GENERIC_AUTH_DETAIL, code="no_active_account") from exc
        if not user.is_active or not user.is_approved:
            raise AuthenticationFailed(GENERIC_AUTH_DETAIL, code="no_active_account")
        return super().validate(attrs)


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="get_full_name", read_only=True)
    initials = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "initials",
            "role",
            "avatar",
            "timezone",
            "is_staff",
        ]
        read_only_fields = ["email", "role", "is_staff"]

    def get_avatar(self, obj):
        if obj.avatar:
            return obj.avatar.url
        return None

    def get_initials(self, obj):
        first = obj.first_name[0] if obj.first_name else ""
        last = obj.last_name[0] if obj.last_name else ""
        return (first + last).upper()
