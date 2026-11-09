from django.urls import include, path, re_path

from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from apps.core.views import health_check, readiness_check
from apps.core.views.media import ProtectedMediaView

urlpatterns = [
    # Health and readiness checks
    path("health/", health_check, name="health-check"),
    path("ready/", readiness_check, name="readiness-check"),
    # API Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="api-docs"),
    path("api/auth/", include("apps.auth.urls")),
    path("api/core/", include("apps.core.urls")),
    path("api/students/", include("apps.students.urls")),
    path("api/lessons/", include("apps.lessons.urls")),
    path("api/billing/", include("apps.billing.urls")),
    path("api/resources/", include("apps.resources.urls")),
    path("api/messaging/", include("apps.messaging.urls")),
    path("api/inventory/", include("apps.inventory.urls")),
    path("api/notifications/", include("apps.notifications.urls")),
    path("api/gigs/", include("apps.gigs.urls")),
    # path('admin/', admin.site.urls),
]

urlpatterns += [
    re_path(
        r"^media/(?P<path>.*)$",
        ProtectedMediaView.as_view(),
        name="protected-media",
    )
]
