from rest_framework import serializers
from .models import BandAvailability, BandExternalEvent, Gig, GigClaim, GigPayout, Venue


class BandExternalEventSerializer(serializers.ModelSerializer):
    band_name = serializers.CharField(source="band.name", read_only=True)

    class Meta:
        model = BandExternalEvent
        fields = [
            "id",
            "band",
            "band_name",
            "uid",
            "title",
            "description",
            "start_time",
            "end_time",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class VenueSerializer(serializers.ModelSerializer):
    allowed_posters = serializers.PrimaryKeyRelatedField(
        many=True,
        read_only=False,
        queryset=__import__("apps.core.models", fromlist=["User"]).User.objects.all(),
        required=False,
    )
    allowed_poster_names = serializers.SerializerMethodField()
    gigs_count = serializers.SerializerMethodField()

    class Meta:
        model = Venue
        fields = [
            "id",
            "studio",
            "name",
            "address",
            "notes",
            "allowed_posters",
            "allowed_poster_names",
            "gigs_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "studio", "created_at", "updated_at"]

    def get_allowed_poster_names(self, obj):
        return [u.get_full_name() or u.email for u in obj.allowed_posters.all()]

    def get_gigs_count(self, obj):
        return obj.gigs.count()


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
        if "month" in data:
            month_date = data["month"]
            data["month"] = month_date.replace(day=1)
        return data


class GigClaimSerializer(serializers.ModelSerializer):
    band_name = serializers.CharField(source="band.name", read_only=True)
    gig_title = serializers.CharField(source="gig.title", read_only=True)
    gig_venue = serializers.SerializerMethodField()
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

    def get_gig_venue(self, obj):
        if obj.gig.venue_ref:
            return obj.gig.venue_ref.name
        return obj.gig.venue


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
    venue_name = serializers.SerializerMethodField()
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
            "venue_ref",
            "venue_name",
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

    def get_venue_name(self, obj):
        if obj.venue_ref:
            return obj.venue_ref.name
        return obj.venue

    def validate(self, data):
        if data.get("scheduled_start") and data.get("scheduled_end"):
            if data["scheduled_start"] >= data["scheduled_end"]:
                raise serializers.ValidationError("Scheduled end time must be after start time")
        return data
