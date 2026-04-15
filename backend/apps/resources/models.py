"""
Resource models - Resource for file/media management
"""

import uuid

from django.db import models
from django.utils import timezone

from apps.core.models import Student, Studio, User


class ResourceFolder(models.Model):
    """
    A virtual folder for organising digital resources, like a Google Drive folder.
    Folders are scoped to a studio and support unlimited nesting via a self-referencing FK.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name="resource_folders")
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
        help_text="Parent folder. Null means this is a root-level folder.",
    )
    name = models.CharField(max_length=200)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="created_folders"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "resource_folders"
        ordering = ["name"]
        unique_together = ("studio", "parent", "name")

    def __str__(self):
        return self.name


class Resource(models.Model):
    """
    Digital or physical resources (sheet music, recordings, instruments, etc.)
    """

    RESOURCE_TYPE_CHOICES = [
        ("pdf", "PDF Document"),
        ("audio", "Audio File"),
        ("video", "Video File"),
        ("image", "Image"),
        ("physical", "Physical Item"),
        ("link", "External Link"),
        ("sheet_music", "Sheet Music"),
        ("chord_chart", "Chord Chart"),
        ("tablature", "Tablature"),
        ("lyrics", "Lyrics"),
        ("other", "Other"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name="resources")
    uploaded_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="uploaded_resources"
    )

    # Band association (optional - if set, resource belongs to specific band)
    band = models.ForeignKey(
        "core.Band",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="resources",
        help_text="If set, this resource belongs to a specific band/group",
    )

    # Resource details
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPE_CHOICES)

    # File information (for digital resources)
    file = models.FileField(
        upload_to="resources/%Y/%m/",
        null=True,
        blank=True,
        help_text="Upload files (PDFs up to 10MB, media files up to 50MB)",
    )
    file_size = models.BigIntegerField(
        null=True, blank=True
    )  # Automatically set if accessed via file property, but useful for caching
    mime_type = models.CharField(max_length=100, blank=True)

    # External link (for link type)
    external_url = models.URLField(blank=True)

    # Organization
    tags = models.JSONField(default=list, blank=True)
    category = models.CharField(max_length=100, blank=True)
    folder = models.ForeignKey(
        "ResourceFolder",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="resources",
        help_text="Virtual folder this resource belongs to. Null = root level.",
    )

    # Music-specific fields
    instrument = models.CharField(
        max_length=100, blank=True, help_text="Primary instrument (Piano, Guitar, Drums, etc.)"
    )
    composer = models.CharField(max_length=200, blank=True, help_text="Composer/Artist name")
    key_signature = models.CharField(
        max_length=20, blank=True, help_text="Musical key (C, G, Am, etc.)"
    )
    tempo = models.CharField(max_length=50, blank=True, help_text="Tempo marking or BPM")
    bpm = models.PositiveIntegerField(null=True, blank=True, help_text="Beats per minute (numeric)")
    capo = models.PositiveSmallIntegerField(null=True, blank=True, help_text="Capo fret (0 = no capo)")
    chord_content = models.TextField(blank=True, help_text="ChordPro-format chord chart text")

    # Physical item tracking
    is_physical_item = models.BooleanField(default=False)
    quantity_total = models.IntegerField(default=1)
    quantity_available = models.IntegerField(default=1)

    # Checkout information
    is_lendable = models.BooleanField(default=False)
    checkout_duration_days = models.IntegerField(default=14)

    # Visibility
    is_public = models.BooleanField(default=False)  # Visible to all students
    shared_with_students = models.ManyToManyField(
        Student, blank=True, related_name="shared_resources"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "resources"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["resource_type"]),
            models.Index(fields=["studio", "is_public"]),
            models.Index(fields=["band"]),
            models.Index(fields=["instrument"]),
            models.Index(fields=["resource_type", "instrument"]),
        ]

    def __str__(self):
        return self.title


class ResourceCheckout(models.Model):
    """
    Track checkout/lending of physical items
    """

    STATUS_CHOICES = [
        ("checked_out", "Checked Out"),
        ("returned", "Returned"),
        ("overdue", "Overdue"),
        ("lost", "Lost"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name="checkouts")
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="resource_checkouts"
    )

    # Checkout details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="checked_out")
    checked_out_at = models.DateTimeField(default=timezone.now)
    due_date = models.DateField()
    returned_at = models.DateTimeField(null=True, blank=True)

    # Notes
    checkout_notes = models.TextField(blank=True)
    return_notes = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "resource_checkouts"
        ordering = ["-checked_out_at"]

    def __str__(self):
        return f"{self.resource.title} - {self.student.user.get_full_name()}"

    @property
    def is_overdue(self):
        """Check if checkout is overdue"""
        if self.status == "returned":
            return False
        return timezone.now().date() > self.due_date


class Setlist(models.Model):
    """
    A collection or "setlist" of resources, like a songbook for a recital.
    Can optionally belong to a band for collaborative approval workflows.
    """

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("proposed", "Proposed"),
        ("confirmed", "Confirmed"),
        ("archived", "Archived"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name="setlists")
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="created_setlists"
    )

    # Band association (optional – when set, enables collaborative features)
    band = models.ForeignKey(
        "core.Band",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="setlists",
        help_text="If set, this setlist belongs to a specific band",
    )

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")

    # Gig context
    event_date = models.DateTimeField(
        null=True, blank=True, help_text="Date/time of the gig or performance"
    )
    venue = models.CharField(max_length=300, blank=True, help_text="Venue or location name")

    resources = models.ManyToManyField(Resource, through="SetlistResource", related_name="setlists")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "resource_setlists"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class SetlistResource(models.Model):
    """
    An item in a setlist. Can be a song (with optional linked resource/chart)
    or a break marker (intermission, tuning, talking, etc.).
    """

    ITEM_TYPE_CHOICES = [
        ("song", "Song"),
        ("break", "Break"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    setlist = models.ForeignKey(Setlist, on_delete=models.CASCADE)

    # Song info — standalone, no file needed
    title = models.CharField(max_length=300, blank=True, help_text="Song title or break label")
    artist = models.CharField(max_length=300, blank=True, help_text="Artist / composer name")
    item_type = models.CharField(max_length=20, choices=ITEM_TYPE_CHOICES, default="song")
    duration_minutes = models.PositiveIntegerField(
        null=True, blank=True, help_text="Estimated duration in minutes"
    )

    # Optional link to a resource (sheet music, charts, etc.)
    resource = models.ForeignKey(
        Resource, on_delete=models.SET_NULL, null=True, blank=True,
        help_text="Optional linked resource (sheet music, chord chart, etc.)"
    )

    order = models.PositiveIntegerField()
    notes = models.CharField(
        max_length=500, blank=True, help_text="Per-song notes (e.g. key, tempo, capo)"
    )

    class Meta:
        db_table = "resource_setlist_resources"
        ordering = ["order"]

    def __str__(self):
        label = self.title or (self.resource.title if self.resource else "Untitled")
        return f"{self.setlist.name} - {label} (#{self.order + 1})"


class SetlistComment(models.Model):
    """
    Comments and approval confirmations on a setlist from band members.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    setlist = models.ForeignKey(Setlist, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="setlist_comments")

    text = models.TextField(help_text="Comment text")
    is_approval = models.BooleanField(
        default=False,
        help_text="If True, this comment doubles as an approval confirmation",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "resource_setlist_comments"
        ordering = ["created_at"]

    def __str__(self):
        action = "approved" if self.is_approval else "commented on"
        return f"{self.user.get_full_name()} {action} {self.setlist.name}"
