import uuid
from django.db import models


class Venue(models.Model):
    """
    A venue that the studio books gigs at.
    allowed_posters controls which users can post gigs here;
    empty means admin-only.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    studio = models.ForeignKey(
        "core.Studio",
        on_delete=models.CASCADE,
        related_name="venues",
    )
    name = models.CharField(max_length=200)
    address = models.CharField(max_length=300, blank=True)
    notes = models.TextField(blank=True)
    allowed_posters = models.ManyToManyField(
        "core.User",
        blank=True,
        related_name="authorized_venues",
        help_text="Users authorized to post gigs here. Empty = admin only.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "gig_venues"
        ordering = ["name"]
        unique_together = [["studio", "name"]]

    def __str__(self):
        return self.name


class BandAvailability(models.Model):
    """
    Stores band monthly availability data
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    band = models.ForeignKey(
        "core.Band",
        on_delete=models.CASCADE,
        related_name="availabilities"
    )
    month = models.DateField(help_text="Normalized to first day of the month (e.g. 2026-07-01)")
    availability_data = models.JSONField(default=dict, blank=True, help_text="Structured availability JSON")
    is_submitted = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "band_availabilities"
        unique_together = ["band", "month"]
        ordering = ["-month", "band__name"]

    def __str__(self):
        return f"{self.band.name} Availability - {self.month.strftime('%Y-%m')}"


class Gig(models.Model):
    """
    Represents a scheduled gig/performance
    """
    STATUS_CHOICES = [
        ("open", "Open"),
        ("pending_approval", "Pending Approval"),
        ("assigned", "Assigned"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    PAY_TYPE_CHOICES = [
        ("flat", "Flat Rate"),
        ("hourly", "Hourly Rate"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    studio = models.ForeignKey(
        "core.Studio",
        on_delete=models.CASCADE,
        related_name="gigs"
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    # venue_ref is the canonical venue FK used for authorization and the dropdown UI.
    # venue (text) is kept for backward compat with the 317booking webhook and old data.
    venue_ref = models.ForeignKey(
        Venue,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="gigs",
    )
    venue = models.CharField(max_length=200, blank=True)
    scheduled_start = models.DateTimeField()
    scheduled_end = models.DateTimeField()
    
    # Null band means the gig is "open" on the marketplace
    band = models.ForeignKey(
        "core.Band",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="gigs"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="open")
    
    # Pay settings
    pay_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    pay_type = models.CharField(max_length=10, choices=PAY_TYPE_CHOICES, default="flat")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "gigs"
        ordering = ["-scheduled_start"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["scheduled_start"]),
        ]

    def __str__(self):
        return f"{self.title} at {self.venue} ({self.scheduled_start.strftime('%Y-%m-%d')})"


class GigClaim(models.Model):
    """
    Request by a band to claim an open gig
    """
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("declined", "Declined"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    gig = models.ForeignKey(
        Gig,
        on_delete=models.CASCADE,
        related_name="claims"
    )
    band = models.ForeignKey(
        "core.Band",
        on_delete=models.CASCADE,
        related_name="gig_claims"
    )
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default="pending")
    notes = models.TextField(blank=True, help_text="Notes from the band leader")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "gig_claims"
        unique_together = ["gig", "band"]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.band.name} claim for {self.gig.title} ({self.status})"


class GigPayout(models.Model):
    """
    Tracks payout records for gigs
    """
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processed", "Processed"),
        ("failed", "Failed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    gig = models.OneToOneField(
        Gig,
        on_delete=models.CASCADE,
        related_name="payout"
    )
    band = models.ForeignKey(
        "core.Band",
        on_delete=models.CASCADE,
        related_name="payouts"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default="pending")
    payment = models.ForeignKey(
        "billing.Payment",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="gig_payouts"
    )
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "gig_payouts"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Payout of ${self.amount} for {self.gig.title} to {self.band.name}"


class BandExternalEvent(models.Model):
    """
    Read-only event imported from an external calendar (iCal)
    Used to block off availability on the Gig Marketplace
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    band = models.ForeignKey(
        "core.Band",
        on_delete=models.CASCADE,
        related_name="external_events"
    )
    uid = models.CharField(max_length=255, db_index=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField(db_index=True)
    end_time = models.DateTimeField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "band_external_events"
        unique_together = ["band", "uid"]
        ordering = ["start_time"]

    def __str__(self):
        return f"{self.title} ({self.start_time.strftime('%Y-%m-%d')})"
