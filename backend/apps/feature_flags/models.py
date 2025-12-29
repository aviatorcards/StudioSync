from django.db import models
from django.utils import timezone
import uuid


class FeatureFlag(models.Model):
    """
    Feature flags for controlling features across the application
    """
    FLAG_TYPE_CHOICES = [
        ('boolean', 'Boolean'),
        ('string', 'String'),
        ('number', 'Number'),
        ('json', 'JSON'),
    ]

    SCOPE_CHOICES = [
        ('global', 'Global'),
        ('studio', 'Studio-Specific'),
        ('user', 'User-Specific'),
        ('role', 'Role-Based'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Identification
    key = models.CharField(max_length=200, unique=True, db_index=True,
                           help_text="Unique key for this flag (e.g., 'stripe_payments')")
    name = models.CharField(max_length=200, help_text="Human-readable name")
    description = models.TextField(blank=True, help_text="Description of what this flag controls")

    # Value and type
    flag_type = models.CharField(max_length=20, choices=FLAG_TYPE_CHOICES, default='boolean')
    value_boolean = models.BooleanField(default=False, null=True, blank=True)
    value_string = models.TextField(blank=True)
    value_number = models.DecimalField(max_digits=20, decimal_places=5, null=True, blank=True)
    value_json = models.JSONField(default=dict, blank=True)

    # Scope and targeting
    scope = models.CharField(max_length=20, choices=SCOPE_CHOICES, default='global')
    target_studios = models.ManyToManyField('core.Studio', blank=True, related_name='feature_flags',
                                            help_text="Studios this flag applies to (if scope=studio)")
    target_roles = models.JSONField(default=list, blank=True,
                                    help_text="Roles this flag applies to (if scope=role), e.g., ['admin', 'teacher']")

    # Metadata
    category = models.CharField(max_length=100, blank=True,
                                help_text="Category for grouping flags (e.g., 'billing', 'notifications')")
    is_active = models.BooleanField(default=True, help_text="Whether this flag is currently active")

    # Rollout percentage (0-100)
    rollout_percentage = models.IntegerField(
        default=100,
        help_text="Percentage of users to enable this flag for (0-100). Uses deterministic hash for consistency."
    )

    # Audit
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey('core.User', on_delete=models.SET_NULL, null=True,
                                   blank=True, related_name='created_flags')

    class Meta:
        db_table = 'feature_flags'
        ordering = ['category', 'name']
        indexes = [
            models.Index(fields=['key', 'is_active']),
            models.Index(fields=['category']),
        ]
        verbose_name = 'Feature Flag'
        verbose_name_plural = 'Feature Flags'

    def __str__(self):
        return f"{self.name} ({self.key})"

    def get_value(self):
        """Return the appropriate value based on flag_type"""
        if self.flag_type == 'boolean':
            return self.value_boolean
        elif self.flag_type == 'string':
            return self.value_string
        elif self.flag_type == 'number':
            return self.value_number
        else:  # json
            return self.value_json


class FeatureFlagOverride(models.Model):
    """
    User or studio-specific overrides for feature flags
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    flag = models.ForeignKey(FeatureFlag, on_delete=models.CASCADE, related_name='overrides')

    # Override target (either user or studio, not both)
    user = models.ForeignKey('core.User', on_delete=models.CASCADE, null=True, blank=True,
                            related_name='flag_overrides',
                            help_text="User this override applies to")
    studio = models.ForeignKey('core.Studio', on_delete=models.CASCADE, null=True, blank=True,
                              related_name='flag_overrides',
                              help_text="Studio this override applies to")

    # Override value (same structure as FeatureFlag)
    value_boolean = models.BooleanField(default=False, null=True, blank=True)
    value_string = models.TextField(blank=True)
    value_number = models.DecimalField(max_digits=20, decimal_places=5, null=True, blank=True)
    value_json = models.JSONField(default=dict, blank=True)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'feature_flag_overrides'
        unique_together = [
            ['flag', 'user'],
            ['flag', 'studio'],
        ]
        verbose_name = 'Feature Flag Override'
        verbose_name_plural = 'Feature Flag Overrides'

    def __str__(self):
        target = self.user or self.studio
        return f"{self.flag.key} override for {target}"

    def clean(self):
        """Ensure either user or studio is set, but not both"""
        from django.core.exceptions import ValidationError
        if self.user and self.studio:
            raise ValidationError("Override cannot target both user and studio")
        if not self.user and not self.studio:
            raise ValidationError("Override must target either a user or a studio")

    def get_value(self):
        """Return the appropriate override value based on flag's type"""
        flag_type = self.flag.flag_type
        if flag_type == 'boolean':
            return self.value_boolean
        elif flag_type == 'string':
            return self.value_string
        elif flag_type == 'number':
            return self.value_number
        else:  # json
            return self.value_json
