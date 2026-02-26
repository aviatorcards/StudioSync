from django.contrib.auth import get_user_model

from rest_framework import serializers

User = get_user_model()


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
