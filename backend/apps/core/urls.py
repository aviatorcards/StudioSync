from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter  # noqa: F401
from config.routers import OptionalSlashRouter
from apps.core.views import (
    DashboardStatsView, DashboardAnalyticsView,
    UserViewSet, StudioViewSet, TeacherViewSet, StudentViewSet, BandViewSet, ReportsExportView,
    gdpr, setup
)

router = OptionalSlashRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'studios', StudioViewSet, basename='studio')
router.register(r'teachers', TeacherViewSet, basename='teacher')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'bands', BandViewSet, basename='band')
# Explicitly handle users/me with optional slash to prevent 404s
from django.urls import re_path
from apps.core.views import UserViewSet
me_list = UserViewSet.as_view({
    'get': 'me',
    'put': 'me',
    'patch': 'me'
})

urlpatterns_manual = [
    re_path(r'^users/me/?$', me_list, name='user-me-manual'),
]

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('analytics/', DashboardAnalyticsView.as_view(), name='dashboard-analytics'),
    path('reports/export/', ReportsExportView.as_view(), name='reports-export'),

    # Setup Wizard Endpoints (trailing slash optional — Next.js proxy strips trailing slashes)
    re_path(r'^setup/status/?$', setup.check_setup_status, name='setup-status'),
    re_path(r'^setup/complete/?$', setup.complete_setup_wizard, name='setup-complete'),

    # GDPR Compliance Endpoints
    path('gdpr/export-data/', gdpr.export_my_data, name='gdpr-export-data'),
    path('gdpr/delete-account/', gdpr.request_account_deletion, name='gdpr-delete-account'),
    path('gdpr/privacy-dashboard/', gdpr.privacy_dashboard, name='gdpr-privacy-dashboard'),
    path('gdpr/privacy-settings/', gdpr.update_privacy_settings, name='gdpr-privacy-settings'),
    path('gdpr/consent/', gdpr.record_consent, name='gdpr-consent'),
] + urlpatterns_manual + [
    path('', include(router.urls)),
]
