from django.urls import include, path

from rest_framework.routers import DefaultRouter  # noqa: F401

from config.routers import OptionalSlashRouter

from . import calendar_views, views

router = OptionalSlashRouter()
router.register(r"lessons", views.LessonViewSet, basename="lesson")
router.register(r"plans", views.LessonPlanViewSet, basename="lesson-plan")
router.register(r"goals", views.StudentGoalViewSet, basename="goal")

urlpatterns = [
    # REST API
    path("", include(router.urls)),
    # Calendar feeds
    path(
        "calendar/teacher/<uuid:teacher_id>/lessons.ics",
        calendar_views.teacher_calendar_feed,
        name="teacher-calendar-feed",
    ),
    path(
        "calendar/student/<uuid:student_id>/lessons.ics",
        calendar_views.student_calendar_feed,
        name="student-calendar-feed",
    ),
    path(
        "calendar/studio/<uuid:studio_id>/lessons.ics",
        calendar_views.studio_calendar_feed,
        name="studio-calendar-feed",
    ),
    path("calendar/my/lessons.ics", calendar_views.my_calendar_feed, name="my-calendar-feed"),
]
