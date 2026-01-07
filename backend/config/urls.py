"""
URL configuration for Music Studio Manager
"""
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('api/auth/', include('apps.auth.urls')),
    path('api/core/', include('apps.core.urls')),
    path('api/students/', include('apps.students.urls')),
    path('api/lessons/', include('apps.lessons.urls')),
    path('api/billing/', include('apps.billing.urls')),
    path('api/resources/', include('apps.resources.urls')),
    path('api/messaging/', include('apps.messaging.urls')),
    path('api/inventory/', include('apps.inventory.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    # path('admin/', admin.site.urls),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
