# Notification System Documentation

## Overview

StudioSync now has a comprehensive, database-backed notification system that alerts users about important events in real-time.

## Features

### ✅ **Notification Types**

1. **Welcome** - New user onboarding
2. **Lesson Scheduled** - New lesson created
3. **Lesson Reminder** - Upcoming lesson (24h before)
4. **Lesson Cancelled** - Lesson cancellation
5. **New Student** - Instructor assigned new student
6. **New Message** - Unread messages
7. **Payment Received** - Payment confirmation
8. **Payment Due** - Payment reminder
9. **Document Pending** - Document requires signature
10. **Document Signed** - Document completed
11. **System Update** - Platform updates
12. **Inventory Request** - Equipment checkout requests
13. **Practice Room Reserved** - Room booking confirmation

### ✅ **Backend API Endpoints**

**Base URL:** `/api/notifications/`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | List all notifications for current user |
| `/recent/` | GET | Get last 50 notifications |
| `/unread_count/` | GET | Get count of unread notifications |
| `/{id}/` | GET | Get single notification |
| `/{id}/mark_read/` | POST | Mark notification as read |
| `/mark_all_read/` | POST | Mark all as read |
| `/clear_all/` | DELETE | Delete all read notifications |

### ✅ **Notification Model Fields**

```python
{
    "id": 1,
    "notification_type": "lesson_scheduled",
    "title": "New Lesson Scheduled",
    "message": "Your Piano lesson is scheduled for December 21 at 03:00 PM",
    "link": "/dashboard/lessons/123",
    "read": false,
    "read_at": null,
    "created_at": "2025-12-20T20:00:00Z",
    "time_ago": "2 mins ago",
    "related_lesson_id": 123,
    "related_student_id": null,
    "related_message_id": null,
    "related_document_id": null
}
```

## Frontend Integration

### **1. Fetch Notifications**

```typescript
// Get all notifications
const response = await api.get('/notifications/')
const notifications = response.data

// Get unread count
const countResponse = await api.get('/notifications/unread_count/')
const unreadCount = countResponse.data.count
```

### **2. Mark as Read**

```typescript
// Mark single notification as read
await api.post(`/notifications/${notificationId}/mark_read/`)

// Mark all as read
await api.post('/notifications/mark_all_read/')
```

### **3. Real-time Updates**

The frontend should poll for new notifications every 30-60 seconds:

```typescript
useEffect(() => {
    const interval = setInterval(async () => {
        const response = await api.get('/notifications/unread_count/')
        setUnreadCount(response.data.count)
    }, 30000) // Every 30 seconds
    
    return () => clearInterval(interval)
}, [])
```

## Creating Notifications

### **From Code**

```python
from apps.notifications.models import Notification

# Create custom notification
Notification.create_notification(
    user=user,
    notification_type='system_update',
    title='New Feature Available',
    message='Check out the new calendar view!',
    link='/dashboard/calendar'
)

# Use helper methods
Notification.notify_lesson_scheduled(lesson)
Notification.notify_new_student(teacher_user, student)
Notification.notify_upcoming_lesson(lesson)
Notification.notify_document_pending(user, 'Liability Waiver')
```

### **Automatic Notifications**

Add signal handlers to automatically create notifications:

```python
# In apps/lessons/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.lessons.models import Lesson
from apps.notifications.models import Notification

@receiver(post_save, sender=Lesson)
def lesson_created_notification(sender, instance, created, **kwargs):
    if created:
        Notification.notify_lesson_scheduled(instance)
```

## Scheduled Reminders

Create a management command for daily reminders:

```python
# apps/notifications/management/commands/send_lesson_reminders.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.lessons.models import Lesson
from apps.notifications.models import Notification

class Command(BaseCommand):
    help = 'Send lesson reminders for tomorrow'
    
    def handle(self, *args, **options):
        tomorrow = timezone.now() + timedelta(days=1)
        tomorrow_start = tomorrow.replace(hour=0, minute=0, second=0)
        tomorrow_end = tomorrow.replace(hour=23, minute=59, second=59)
        
        lessons = Lesson.objects.filter(
            scheduled_start__gte=tomorrow_start,
            scheduled_start__lte=tomorrow_end,
            status='scheduled'
        )
        
        for lesson in lessons:
            Notification.notify_upcoming_lesson(lesson)
        
        self.stdout.write(f'Sent {lessons.count()} lesson reminders')
```

Run with cron:
```bash
0 18 * * * cd /path/to/project && python manage.py send_lesson_reminders
```

## Migration

Run migrations to create the notification table:

```bash
python manage.py makemigrations notifications
python manage.py migrate notifications
```

## Admin Interface

Notifications can be managed in Django Admin at `/admin/notifications/notification/`

Features:
- View all notifications
- Filter by type, read status, date
- Search by user, title, message
- Manually create notifications

## Best Practices

1. **Keep messages concise** - Notification messages should be short and actionable
2. **Always include links** - Make it easy for users to take action
3. **Don't spam** - Batch similar notifications when possible
4. **Clean up old notifications** - Periodically delete read notifications older than 30 days
5. **Test notification flow** - Ensure notifications appear for the right users at the right time

## Future Enhancements

- [ ] Email notifications for critical events
- [ ] SMS notifications (via Twilio)
- [ ] Push notifications (PWA)
- [ ] Notification preferences per user
- [ ] Batch digest emails (daily/weekly summary)
- [ ] WebSocket real-time updates (no polling needed)

## Troubleshooting

**Notifications not appearing?**
- Check that the notifications app is in INSTALLED_APPS
- Run migrations
- Verify API endpoint is accessible
- Check browser console for errors

**Read status not persisting?**
- Ensure mark_read endpoint is being called
- Check that user has permission to update notification
- Verify database connection

**Too many notifications?**
- Implement notification preferences
- Add "mute" functionality for specific types
- Batch similar notifications together
