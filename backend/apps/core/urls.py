from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.core.stats_views import DashboardStatsView
from apps.core.views import (
    UserViewSet, StudioViewSet, TeacherViewSet, StudentViewSet, BandViewSet, ReportsExportView
)
from apps.core import gdpr_views

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'studios', StudioViewSet, basename='studio')
router.register(r'teachers', TeacherViewSet, basename='teacher')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'bands', BandViewSet, basename='band')

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('reports/export/', ReportsExportView.as_view(), name='reports-export'),
    
    # GDPR Compliance Endpoints
    path('gdpr/export-data/', gdpr_views.export_my_data, name='gdpr-export-data'),
    path('gdpr/delete-account/', gdpr_views.request_account_deletion, name='gdpr-delete-account'),
    path('gdpr/privacy-dashboard/', gdpr_views.privacy_dashboard, name='gdpr-privacy-dashboard'),
    path('gdpr/privacy-settings/', gdpr_views.update_privacy_settings, name='gdpr-privacy-settings'),
    path('gdpr/consent/', gdpr_views.record_consent, name='gdpr-consent'),
    
    path('', include(router.urls)),
]
