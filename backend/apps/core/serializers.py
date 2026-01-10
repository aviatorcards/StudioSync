from rest_framework import serializers
from .models import User, Studio, Teacher, Student, Band, Family, SetupStatus, SignedDocument

class BandSerializer(serializers.ModelSerializer):
    """Serializer for Band/Group management"""
    members_count = serializers.SerializerMethodField()
    member_details = serializers.SerializerMethodField()
    member_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Student.objects.all(), 
        source='members',
        required=False
    )
    
    class Meta:
        model = Band
        fields = [
            'id', 'name', 'genre', 'photo', 'primary_contact', 'billing_email', 'billing_phone',
            'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country',
            'notes', 'members_count', 'member_ids', 'member_details'
        ]

    def get_members_count(self, obj):
        return obj.members.count()

    def get_member_details(self, obj):
        return [
            {
                'id': student.id,
                'full_name': student.user.get_full_name(),
                'instrument': student.instrument
            } for student in obj.members.all()
        ]

class FamilySerializer(serializers.ModelSerializer):
    """Serializer for Family relationships"""
    students_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Family
        fields = [
            'id', 'primary_parent', 'secondary_parent', 'emergency_contact_name',
            'emergency_contact_phone', 'address', 'billing_email', 'students_count'
        ]

    def get_students_count(self, obj):
        return obj.students.count()

class SimpleStudioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Studio
        fields = ['id', 'name', 'address_line1', 'city', 'state', 'postal_code', 'country', 'settings']

class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile management"""
    full_name = serializers.SerializerMethodField()
    student_profile = serializers.SerializerMethodField()
    teacher_profile = serializers.SerializerMethodField()
    studio = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name', 
            'phone', 'role', 'timezone', 'avatar', 'preferences',
            'student_profile', 'teacher_profile', 'studio', 'is_active'
        ]
        read_only_fields = ['id', 'email', 'full_name']

    def update(self, instance, validated_data):
        # Perform standard update
        instance = super().update(instance, validated_data)
        
        # Sync is_active to related profiles if changed
        if 'is_active' in validated_data:
            is_active = validated_data['is_active']
            if hasattr(instance, 'student_profile'):
                instance.student_profile.is_active = is_active
                instance.student_profile.save()
            if hasattr(instance, 'teacher_profile'):
                instance.teacher_profile.is_active = is_active
                instance.teacher_profile.save()
        
        # Ensure profile exists for the new role
        role = instance.role
        
        if role == 'teacher' and not hasattr(instance, 'teacher_profile'):
            from .models import Teacher, Studio
            # Assign to first studio available or owner's studio (fallback logic)
            studio = Studio.objects.first()
            Teacher.objects.create(user=instance, studio=studio)
            # Refresh to ensure teacher_profile is accessible immediately
            instance.refresh_from_db()
            
        elif role == 'student' and not hasattr(instance, 'student_profile'):
            from .models import Student, Studio
            studio = Studio.objects.first()
            # Default to active=True or copy user state? Should match logic above, but create assumes Active usually. 
            # If user is inactive, maybe student should be too?
            # Let's trust the defaults or subsequent updates.
            Student.objects.create(user=instance, studio=studio, instrument='')
            instance.refresh_from_db()
            
        return instance

    def get_full_name(self, obj):
        return obj.get_full_name()

    def get_student_profile(self, obj):
        if obj.role == 'student' and hasattr(obj, 'student_profile'):
            student = obj.student_profile
            return {
                'id': student.id,
                'instrument': student.instrument,
                'bands': [{'id': b.id, 'name': b.name} for b in student.bands.all()],
                'family_id': student.family_id
            }
        return None

    def get_teacher_profile(self, obj):
        if obj.role == 'teacher' and hasattr(obj, 'teacher_profile'):
            teacher = obj.teacher_profile
            return {
                'id': teacher.id,
                'students_count': teacher.primary_students.count(),
                'studio_id': teacher.studio_id
            }
        return None

    def get_studio(self, obj):
        # Return studio for owner or teacher
        studio = None
        if hasattr(obj, 'owned_studios') and obj.owned_studios.exists():
            studio = obj.owned_studios.first()
        elif obj.role == 'teacher' and hasattr(obj, 'teacher_profile'):
            studio = obj.teacher_profile.studio
            
        if studio:
            return SimpleStudioSerializer(studio).data
        return None

class StudioSerializer(serializers.ModelSerializer):
    """Serializer for studio settings"""
    class Meta:
        model = Studio
        fields = [
            'id', 'name', 'subdomain', 'email', 'phone', 'website',
            'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country',
            'timezone', 'currency', 'settings'
        ]
        read_only_fields = ['id', 'owner']

class PublicTeacherSerializer(serializers.ModelSerializer):
    """Serializer for public teacher profiles"""
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    avatar = serializers.ImageField(source='user.avatar')
    
    class Meta:
        model = Teacher
        fields = [
            'id', 'first_name', 'last_name', 'avatar',
            'bio', 'specialties', 'instruments'
        ]

class TeacherSerializer(serializers.ModelSerializer):
    """Full teacher serializer for admin management"""
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    avatar = serializers.FileField(source='user.avatar', read_only=True)
    students_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Teacher
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone', 'avatar',
            'bio', 'specialties', 'instruments', 'hourly_rate',
            'availability', 'auto_accept_bookings', 'booking_buffer_minutes',
            'is_active', 'students_count'
        ]

    def get_students_count(self, obj):
        # Count primary students
        return obj.primary_students.count()

class StudentSerializer(serializers.ModelSerializer):
    """Full student serializer for admin management"""
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    user = UserSerializer(read_only=True)
    
    # Allow passing user ID directly for writes
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        source='user',
        write_only=True,
        required=False
    )

    primary_teacher = PublicTeacherSerializer(read_only=True)

    class Meta:
        model = Student
        fields = [
            'id', 'user', 'user_id', 'email', 'first_name', 'last_name', 'phone',
            'instrument', 'skill_level', 'primary_teacher', 'enrollment_date',
            'birth_date', 'total_lessons', 'last_lesson_date',
            'family', 'studio', 'notes', 'is_active', 'bands'
        ]


# ============================================================================
# Setup Wizard Serializers
# ============================================================================

class SetupStatusSerializer(serializers.ModelSerializer):
    """Serializer for checking setup completion status"""
    class Meta:
        model = SetupStatus
        fields = ['is_completed', 'completed_at', 'setup_version', 'features_enabled', 'setup_data']
        read_only_fields = ['completed_at']


class SetupWizardCompleteSerializer(serializers.Serializer):
    """Serializer for completing the entire setup wizard"""

    # Step 1: Language
    language = serializers.CharField(max_length=10, default='en')

    # Step 2: Studio Info
    studio_name = serializers.CharField(max_length=200)
    studio_email = serializers.EmailField()
    studio_phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    address_line1 = serializers.CharField(max_length=200, required=False, allow_blank=True)
    address_line2 = serializers.CharField(max_length=200, required=False, allow_blank=True)
    city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    state = serializers.CharField(max_length=100, required=False, allow_blank=True)
    postal_code = serializers.CharField(max_length=20, required=False, allow_blank=True)
    country = serializers.CharField(max_length=100, default='US')
    timezone = serializers.CharField(max_length=50, default='UTC')
    currency = serializers.CharField(max_length=3, default='USD')

    # Step 3: Admin Account
    admin_email = serializers.EmailField()
    admin_first_name = serializers.CharField(max_length=100)
    admin_last_name = serializers.CharField(max_length=100)
    admin_password = serializers.CharField(write_only=True, min_length=8)
    admin_phone = serializers.CharField(max_length=20, required=False, allow_blank=True)

    # Step 4: Feature Selection
    billing_enabled = serializers.BooleanField(default=True)
    inventory_enabled = serializers.BooleanField(default=True)
    messaging_enabled = serializers.BooleanField(default=True)
    resources_enabled = serializers.BooleanField(default=True)
    goals_enabled = serializers.BooleanField(default=True)
    bands_enabled = serializers.BooleanField(default=True)
    analytics_enabled = serializers.BooleanField(default=True)
    practice_rooms_enabled = serializers.BooleanField(default=True)

    # Step 5: Quick Settings
    default_lesson_duration = serializers.IntegerField(default=60, min_value=15, max_value=240)
    business_start_hour = serializers.IntegerField(default=9, min_value=0, max_value=23)
    business_end_hour = serializers.IntegerField(default=18, min_value=0, max_value=23)

    # Step: Expanded Business Rules (Billing, Scheduling, Events)
    # Billing
    default_hourly_rate = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, min_value=0)
    tax_rate = serializers.DecimalField(max_digits=5, decimal_places=2, default=0, min_value=0, max_value=100)
    charge_tax_on_lessons = serializers.BooleanField(default=False)
    invoice_due_days = serializers.IntegerField(default=14, min_value=0)
    invoice_footer_text = serializers.CharField(required=False, allow_blank=True)

    # Scheduling
    cancellation_notice_period = serializers.IntegerField(default=24, min_value=0, help_text="Hours notice required")
    enable_online_booking = serializers.BooleanField(default=False)

    # Events
    default_event_duration = serializers.IntegerField(default=60, min_value=15, max_value=480)

    # Step: Email Settings
    smtp_host = serializers.CharField(max_length=255, required=False, allow_blank=True)
    smtp_port = serializers.IntegerField(default=587)
    smtp_username = serializers.CharField(max_length=255, required=False, allow_blank=True)
    smtp_password = serializers.CharField(max_length=255, required=False, allow_blank=True)
    smtp_from_email = serializers.EmailField(required=False, allow_blank=True)
    smtp_use_tls = serializers.BooleanField(default=True)

    # Step 6: Sample Data
    create_sample_data = serializers.BooleanField(default=False)

    def validate_admin_email(self, value):
        """Ensure admin email is unique"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, data):
        """Cross-field validation"""
        # Removed validation for business_end_hour > business_start_hour
        # to support overnight schedules (e.g. 4 PM to 2 AM)
        return data


class SignedDocumentSerializer(serializers.ModelSerializer):
    """Serializer for signed documents"""
    family_name = serializers.ReadOnlyField(source='family.primary_parent.get_full_name')
    signed_by_name = serializers.ReadOnlyField(source='signed_by.get_full_name')

    class Meta:
        model = SignedDocument
        fields = [
            'id', 'family', 'family_name', 'document_type', 'title',
            'file', 'signed_by', 'signed_by_name', 'signed_at',
            'ip_address', 'created_at'
        ]
        read_only_fields = ['signed_by', 'signed_at', 'ip_address', 'created_at']

