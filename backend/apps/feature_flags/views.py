from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.cache import cache
from .models import FeatureFlag, FeatureFlagOverride
from .serializers import FeatureFlagSerializer, FeatureFlagListSerializer
import hashlib


class FeatureFlagViewSet(viewsets.ModelViewSet):
    """API for managing feature flags"""
    queryset = FeatureFlag.objects.all()
    serializer_class = FeatureFlagSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return FeatureFlagListSerializer
        return FeatureFlagSerializer

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active feature flags for the current user"""
        user = request.user
        cache_key = f"feature_flags:user:{user.id}"
        
        cached_flags = cache.get(cache_key)
        if cached_flags:
            return Response(cached_flags)
        
        flags = self._evaluate_flags_for_user(user)
        cache.set(cache_key, flags, 300)  # 5 minutes
        
        return Response(flags)
    
    @action(detail=False, methods=['get'])
    def check(self, request):
        """Check a specific flag: /api/feature-flags/flags/check/?key=stripe_payments"""
        key = request.query_params.get('key')
        if not key:
            return Response({'error': 'key parameter required'}, status=400)
        
        value = self._check_flag(key, request.user)
        return Response({'key': key, 'enabled': value})
    
    def _evaluate_flags_for_user(self, user):
        """Evaluate all active flags for a user"""
        flags = []
        for flag in FeatureFlag.objects.filter(is_active=True):
            flags.append({
                "key": flag.key,
                "value": self._check_flag_instance(flag, user)
            })
        return flags
    
    def _check_flag(self, key, user):
        """Check a specific flag by key"""
        try:
            flag = FeatureFlag.objects.get(key=key, is_active=True)
            return self._check_flag_instance(flag, user)
        except FeatureFlag.DoesNotExist:
            return False
    
    def _check_flag_instance(self, flag, user):
        """Evaluate flag value for a specific user"""
        # Check for user-specific override
        override = FeatureFlagOverride.objects.filter(
            flag=flag, user=user, is_active=True
        ).first()
        
        if override:
            return override.get_value()
        
        # Check scope-based targeting
        if flag.scope == 'role' and user.role not in flag.target_roles:
            return False
        
        # Check rollout percentage
        if flag.rollout_percentage < 100:
            hash_input = f"{flag.key}:{user.id}"
            hash_value = int(hashlib.md5(hash_input.encode()).hexdigest(), 16)
            percentage = (hash_value % 100) + 1
            if percentage > flag.rollout_percentage:
                return False
        
        return flag.get_value()
