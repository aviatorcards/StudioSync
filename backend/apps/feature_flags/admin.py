from django.contrib import admin
from .models import FeatureFlag, FeatureFlagOverride


@admin.register(FeatureFlag)
class FeatureFlagAdmin(admin.ModelAdmin):
    list_display = ['name', 'key', 'flag_type', 'scope', 'is_active', 'rollout_percentage', 'created_at']
    list_filter = ['flag_type', 'scope', 'is_active', 'category']
    search_fields = ['key', 'name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('key', 'name', 'description', 'category')
        }),
        ('Value', {
            'fields': ('flag_type', 'value_boolean', 'value_string', 'value_number', 'value_json')
        }),
        ('Targeting', {
            'fields': ('scope', 'target_studios', 'target_roles', 'rollout_percentage')
        }),
        ('Status', {
            'fields': ('is_active', 'created_by', 'created_at', 'updated_at')
        }),
    )


@admin.register(FeatureFlagOverride)
class FeatureFlagOverrideAdmin(admin.ModelAdmin):
    list_display = ['flag', 'user', 'studio', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['flag__key', 'user__email', 'studio__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
