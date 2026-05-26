"""
Messaging models - Message, Thread, Notification
"""

import uuid

from django.db import models
from apps.core.models import Studio, User


class MessageThread(models.Model):
    """
    Conversation thread between users
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name="message_threads")

    # Participants
    participants = models.ManyToManyField(User, related_name="message_threads")

    # Subject/topic
    subject = models.CharField(max_length=200, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "message_threads"
        ordering = ["-updated_at"]

    def __str__(self):
        return self.subject or f"Thread {self.id}"


class Message(models.Model):
    """
    Individual message in a thread
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    thread = models.ForeignKey(MessageThread, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")

    # Content
    body = models.TextField()

    # Attachments
    attachments = models.JSONField(default=list, blank=True)

    # Read tracking
    read_by = models.ManyToManyField(User, blank=True, related_name="read_messages")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "messages"
        ordering = ["created_at"]

    def __str__(self):
        return f"Message from {self.sender.get_full_name()} at {self.created_at}"


