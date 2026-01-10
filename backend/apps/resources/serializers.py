from rest_framework import serializers
from .models import Resource, ResourceCheckout

class ResourceSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.SerializerMethodField()
    file_url = serializers.FileField(source='file', read_only=True)
    
    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'description', 'resource_type', 
            'file', 'file_url', 'external_url', 'tags', 'category',
            'uploaded_by', 'uploaded_by_name', 'created_at',
            'is_public', 'is_lendable', 'quantity_available'
        ]
        read_only_fields = ['uploaded_by', 'file_size']

    def get_uploaded_by_name(self, obj):
        if obj.uploaded_by:
            return obj.uploaded_by.get_full_name()
        return "Unknown"

    def create(self, validated_data):
        # Handle tags from FormData (may come as JSON string)
        if 'tags' in validated_data and isinstance(validated_data['tags'], str):
            import json
            try:
                validated_data['tags'] = json.loads(validated_data['tags'])
            except (json.JSONDecodeError, TypeError):
                validated_data['tags'] = []

        # Set file size if file is present
        if 'file' in validated_data and validated_data['file']:
            validated_data['file_size'] = validated_data['file'].size

        # Note: uploaded_by and studio are now set in perform_create()
        return super().create(validated_data)


class ResourceCheckoutSerializer(serializers.ModelSerializer):
    """Serializer for resource checkouts"""
    resource_title = serializers.ReadOnlyField(source='resource.title')
    student_name = serializers.ReadOnlyField(source='student.user.get_full_name')
    is_overdue = serializers.ReadOnlyField()

    class Meta:
        model = ResourceCheckout
        fields = [
            'id', 'resource', 'resource_title', 'student', 'student_name',
            'status', 'checked_out_at', 'due_date', 'returned_at',
            'checkout_notes', 'return_notes', 'is_overdue',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['checked_out_at', 'created_at', 'updated_at']
