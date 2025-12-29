from django.core.cache import cache
from django.utils.deprecation import MiddlewareMixin


class FeatureFlagMiddleware(MiddlewareMixin):
    """Adds feature flags to request object for easy access in views"""
    
    def process_request(self, request):
        if hasattr(request, 'user') and request.user.is_authenticated:
            cache_key = f"feature_flags:user:{request.user.id}"
            flags = cache.get(cache_key)
            
            if not flags:
                from .views import FeatureFlagViewSet
                viewset = FeatureFlagViewSet()
                flags = viewset._evaluate_flags_for_user(request.user)
                cache.set(cache_key, flags, 300)
            
            request.feature_flags = flags
        else:
            request.feature_flags = {}
