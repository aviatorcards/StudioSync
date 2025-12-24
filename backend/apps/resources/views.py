from rest_framework import viewsets, permissions, filters, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from .models import Resource
from .serializers import ResourceSerializer

class ResourceViewSet(viewsets.ModelViewSet):
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['created_at', 'title']

    def get_queryset(self):
        user = self.request.user
        # If Admin/Teacher, show studio resources
        # If Student, show publicly shared resources?
        # For MVP, assuming Admin context mostly.
        return Resource.objects.filter(studio__owner=user)
