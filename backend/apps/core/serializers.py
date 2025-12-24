from rest_framework import serializers
from .models import User, Studio, Teacher, Student, Band, Family

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

class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile management"""
    full_name = serializers.SerializerMethodField()
    student_profile = serializers.SerializerMethodField()
    teacher_profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name', 
            'phone', 'role', 'timezone', 'avatar', 'preferences',
            'student_profile', 'teacher_profile', 'is_active'
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
                'students_count': teacher.primary_students.count()
            }
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

