from .health import health_check, readiness_check
from .core import (
    UserViewSet, StudioViewSet, TeacherViewSet, 
    StudentViewSet, BandViewSet, ReportsExportView
)
from .gdpr import (
    export_my_data, request_account_deletion, 
    privacy_dashboard, update_privacy_settings, record_consent
)
from .setup import (
    check_setup_status, complete_setup_wizard
)
from .stats import (
    DashboardStatsView, DashboardAnalyticsView
)

# Expose modules for direct access
from . import gdpr
from . import setup
from . import stats
from . import core
