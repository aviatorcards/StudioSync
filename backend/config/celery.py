"""
Celery configuration for Music Studio Manager
"""
import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('music_studio')
app.config_from_object('django.conf:settings', namespace='CELERY')

# Fix for Celery 6.0 deprecation warning
app.conf.broker_connection_retry_on_startup = True

app.autodiscover_tasks()

# Periodic tasks
app.conf.beat_schedule = {
    'send-lesson-reminders-hourly': {
        'task': 'apps.core.tasks.check_upcoming_lessons',
        'schedule': crontab(minute=0),  # Execute every hour at minute 0
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
