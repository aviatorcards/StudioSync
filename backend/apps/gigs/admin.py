from django.contrib import admin
from .models import BandAvailability, Gig, GigClaim, GigPayout


@admin.register(BandAvailability)
class BandAvailabilityAdmin(admin.ModelAdmin):
    list_display = ["band", "month", "is_submitted", "submitted_at"]
    list_filter = ["month", "is_submitted"]
    search_fields = ["band__name"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(Gig)
class GigAdmin(admin.ModelAdmin):
    list_display = ["title", "venue", "scheduled_start", "scheduled_end", "band", "status", "pay_rate", "pay_type"]
    list_filter = ["status", "pay_type", "scheduled_start"]
    search_fields = ["title", "venue", "band__name"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(GigClaim)
class GigClaimAdmin(admin.ModelAdmin):
    list_display = ["gig", "band", "status", "created_at"]
    list_filter = ["status", "created_at"]
    search_fields = ["gig__title", "band__name"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(GigPayout)
class GigPayoutAdmin(admin.ModelAdmin):
    list_display = ["gig", "band", "amount", "status", "payment", "processed_at"]
    list_filter = ["status", "processed_at"]
    search_fields = ["gig__title", "band__name"]
    readonly_fields = ["created_at", "updated_at", "processed_at"]
