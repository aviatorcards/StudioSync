from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.core.views import (
    DashboardStatsView, DashboardAnalyticsView,
    UserViewSet, StudioViewSet, TeacherViewSet, StudentViewSet, BandViewSet, ReportsExportView,
    gdpr, setup
)

router = DefaultRouter()
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
    path('stats', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('analytics', DashboardAnalyticsView.as_view(), name='dashboard-analytics'),
    path('reports/export', ReportsExportView.as_view(), name='reports-export'),

    # Setup Wizard Endpoints
    path('setup/status/', setup.check_setup_status, name='setup-status'),
    path('setup/complete/', setup.complete_setup_wizard, name='setup-complete'),

    # GDPR Compliance Endpoints
    path('gdpr/export-data', gdpr.export_my_data, name='gdpr-export-data'),
    path('gdpr/delete-account', gdpr.request_account_deletion, name='gdpr-delete-account'),
    path('gdpr/privacy-dashboard', gdpr.privacy_dashboard, name='gdpr-privacy-dashboard'),
    path('gdpr/privacy-settings', gdpr.update_privacy_settings, name='gdpr-privacy-settings'),
    path('gdpr/consent', gdpr.record_consent, name='gdpr-consent'),
] + urlpatterns_manual + [
    path('', include(router.urls)),
]
