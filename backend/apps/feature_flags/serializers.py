from rest_framework import serializers
from .models import FeatureFlag, FeatureFlagOverride


class FeatureFlagSerializer(serializers.ModelSerializer):
    """Serializer for Feature Flags"""

    class Meta:
        model = FeatureFlag
        fields = [
            'id', 'key', 'name', 'description', 'flag_type',
            'value_boolean', 'value_string', 'value_number', 'value_json',
            'scope', 'target_studios', 'target_roles', 'category', 'is_active',
            'rollout_percentage', 'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class FeatureFlagListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing flags"""
    value = serializers.SerializerMethodField()

    class Meta:
        model = FeatureFlag
        fields = ['id', 'key', 'name', 'flag_type', 'value', 'category', 'is_active']

    def get_value(self, obj):
        return obj.get_value()
