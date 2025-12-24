from rest_framework import serializers
from .models import Resource

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
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
             validated_data['uploaded_by'] = request.user
             # Auto-assign studio if possible (assuming user is owner or associated)
             # For now, we assume user is owner. If user is teacher, might need better logic.
             from apps.core.models import Studio
             studio = Studio.objects.filter(owner=request.user).first()
             if studio:
                 validated_data['studio'] = studio
        
        if 'file' in validated_data and validated_data['file']:
            validated_data['file_size'] = validated_data['file'].size
            
        return super().create(validated_data)
