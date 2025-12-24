from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from .models import Invoice
from .serializers import InvoiceSerializer

class InvoiceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing invoices
    """
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Admin: See all invoices for their owned studios
        if user.role == 'admin':
            return Invoice.objects.filter(studio__owner=user)
            
        # Students: See their own invoices (direct or via band)
        if hasattr(user, 'student_profile'):
            student = user.student_profile
            return Invoice.objects.filter(
                Q(student=student) | 
                Q(band__in=student.bands.all())
            ).distinct()
            
        # Parents: See invoices for their families? (Future scope)
        if hasattr(user, 'primary_parent_families'):
            # Basic support for parents
            return Invoice.objects.filter(
                student__family__primary_parent=user
            ).distinct()
            
        return Invoice.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        studio = None
        
        if user.role == 'admin':
            from apps.core.models import Studio
            studio = Studio.objects.filter(owner=user).first()
        elif user.role == 'teacher' and hasattr(user, 'teacher_profile'):
            studio = user.teacher_profile.studio
            
        if studio:
            serializer.save(studio=studio)
        else:
            # If no studio found, try to use the first studio in the system for demo purposes 
            # (or raise a validation error in production)
            from apps.core.models import Studio
            studio = Studio.objects.first()
            if studio:
                serializer.save(studio=studio)
            else:
                raise serializer.ValidationError("No studio found to associate with this invoice.")
