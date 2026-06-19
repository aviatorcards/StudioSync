from rest_framework import serializers
from .models import BandAvailability, Gig, GigClaim, GigPayout


class BandAvailabilitySerializer(serializers.ModelSerializer):
    band_name = serializers.CharField(source="band.name", read_only=True)

    class Meta:
        model = BandAvailability
        fields = [
            "id",
            "band",
            "band_name",
            "month",
            "availability_data",
            "is_submitted",
            "submitted_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "submitted_at", "created_at", "updated_at"]

    def validate(self, data):
        # Normalize the month date to the first of the month
        if "month" in data:
            month_date = data["month"]
            data["month"] = month_date.replace(day=1)
        return data


class GigClaimSerializer(serializers.ModelSerializer):
    band_name = serializers.CharField(source="band.name", read_only=True)
    gig_title = serializers.CharField(source="gig.title", read_only=True)
    gig_venue = serializers.CharField(source="gig.venue", read_only=True)
    gig_start = serializers.DateTimeField(source="gig.scheduled_start", read_only=True)

    class Meta:
        model = GigClaim
        fields = [
            "id",
            "gig",
            "gig_title",
            "gig_venue",
            "gig_start",
            "band",
            "band_name",
            "status",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "status", "created_at", "updated_at"]


class GigPayoutSerializer(serializers.ModelSerializer):
    band_name = serializers.CharField(source="band.name", read_only=True)
    gig_title = serializers.CharField(source="gig.title", read_only=True)

    class Meta:
        model = GigPayout
        fields = [
            "id",
            "gig",
            "gig_title",
            "band",
            "band_name",
            "amount",
            "status",
            "payment",
            "processed_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "payment", "processed_at", "created_at", "updated_at"]


class GigSerializer(serializers.ModelSerializer):
    band_name = serializers.CharField(source="band.name", read_only=True)
    claims = GigClaimSerializer(many=True, read_only=True)
    payout = GigPayoutSerializer(read_only=True)

    class Meta:
        model = Gig
        fields = [
            "id",
            "studio",
            "title",
            "description",
            "venue",
            "scheduled_start",
            "scheduled_end",
            "band",
            "band_name",
            "status",
            "pay_rate",
            "pay_type",
            "claims",
            "payout",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, data):
        """Validate scheduled times"""
        if data.get("scheduled_start") and data.get("scheduled_end"):
            if data["scheduled_start"] >= data["scheduled_end"]:
                raise serializers.ValidationError("Scheduled end time must be after start time")
        return data
