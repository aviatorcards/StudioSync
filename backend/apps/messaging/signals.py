from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Message
from apps.core.tasks import send_email_async
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Message)
def notify_new_message(sender, instance, created, **kwargs):
    """
    Send email notification when a new message is created
    """
    if created:
        # Broadcast to WebSocket
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            
            channel_layer = get_channel_layer()
            thread_group = f"chat_{instance.thread.id}"
            
            message_data = {
                'id': str(instance.id),
                'sender': str(instance.sender.id),
                'sender_details': {
                    'id': str(instance.sender.id),
                    'full_name': instance.sender.get_full_name(),
                    'avatar': instance.sender.avatar.url if instance.sender.avatar else None,
                    'role': instance.sender.role # Assuming role exists on user
                },
                'body': instance.body,
                'created_at': instance.created_at.isoformat(),
                'read_by': []
            }
            
            async_to_sync(channel_layer.group_send)(
                thread_group,
                {
                    'type': 'chat_message',
                    'message': message_data
                }
            )
        except Exception as e:
            logger.error(f"Error broadcasting message to websocket: {e}")

        # Send Email Notifications
        try:
            thread = instance.thread
            message_sender = instance.sender
            
            # Identify recipients (everyone in thread except sender)
            recipients = thread.participants.exclude(id=message_sender.id)
            
            for recipient in recipients:
                # Skip if recipient has disabled notifications (if such preference exists)
                # For now, just send to everyone
                
                subject = f"New Message from {message_sender.get_full_name()}"
                
                context = {
                    'first_name': recipient.first_name,
                    'sender': message_sender,
                    'message_preview': instance.body,
                    'message_url': f"http://localhost:3000/dashboard/messages/{thread.id}" # TODO: Make dynamic base URL
                }
                
                send_email_async.delay(
                    subject, 
                    recipient.email, 
                    'emails/new_message_notification.html', 
                    context
                )
                
            logger.info(f"Triggered notification emails for Message {instance.id}")
            
        except Exception as e:
            logger.error(f"Error sending message notifications: {e}")
