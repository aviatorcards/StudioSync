"""
Tests for Songbook API functionality
"""
import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APIClient
from apps.core.models import User, Studio, Teacher
from apps.resources.models import Resource


@pytest.mark.django_db
class TestSongbookAPI:
    """Test suite for songbook-specific resource functionality"""

    @pytest.fixture
    def setup_data(self):
        """Create test data"""
        # Create studio owner
        owner = User.objects.create_user(
            email='owner@test.com',
            password='testpass123',
            first_name='Test',
            last_name='Owner',
            role='admin'
        )
        
        # Create studio
        studio = Studio.objects.create(
            name='Test Studio',
            owner=owner,
            email='studio@test.com'
        )
        
        # Create teacher
        teacher_user = User.objects.create_user(
            email='teacher@test.com',
            password='testpass123',
            first_name='Test',
            last_name='Teacher',
            role='teacher'
        )
        teacher = Teacher.objects.create(
            user=teacher_user,
            studio=studio
        )
        
        return {
            'studio': studio,
            'teacher_user': teacher_user,
            'teacher': teacher
        }

    def test_upload_sheet_music(self, setup_data):
        """Test uploading sheet music with music-specific fields"""
        client = APIClient()
        client.force_authenticate(user=setup_data['teacher_user'])
        
        # Create a fake PDF file
        pdf_file = SimpleUploadedFile(
            "test_sheet.pdf",
            b"fake pdf content",
            content_type="application/pdf"
        )
        
        data = {
            'title': 'Für Elise',
            'description': 'Classic piano piece',
            'resource_type': 'sheet_music',
            'instrument': 'Piano',
            'skill_level': 'intermediate',
            'composer': 'Beethoven',
            'key_signature': 'A minor',
            'tempo': 'Andante',
            'file': pdf_file
        }
        
        response = client.post('/api/resources/library/', data, format='multipart')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['title'] == 'Für Elise'
        assert response.data['instrument'] == 'Piano'
        assert response.data['skill_level'] == 'intermediate'
        assert response.data['composer'] == 'Beethoven'

    def test_music_resource_requires_instrument(self, setup_data):
        """Test that music resources require instrument field"""
        client = APIClient()
        client.force_authenticate(user=setup_data['teacher_user'])
        
        pdf_file = SimpleUploadedFile(
            "test_chart.pdf",
            b"fake pdf content",
            content_type="application/pdf"
        )
        
        data = {
            'title': 'Test Chart',
            'resource_type': 'chord_chart',
            'skill_level': 'beginner',
            'file': pdf_file
            # Missing instrument field
        }
        
        response = client.post('/api/resources/library/', data, format='multipart')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'instrument' in response.data

    def test_filter_by_instrument(self, setup_data):
        """Test filtering resources by instrument"""
        client = APIClient()
        client.force_authenticate(user=setup_data['teacher_user'])
        
        # Create piano resource
        Resource.objects.create(
            studio=setup_data['studio'],
            uploaded_by=setup_data['teacher_user'],
            title='Piano Scales',
            resource_type='sheet_music',
            instrument='Piano',
            skill_level='beginner'
        )
        
        # Create guitar resource
        Resource.objects.create(
            studio=setup_data['studio'],
            uploaded_by=setup_data['teacher_user'],
            title='Guitar Chords',
            resource_type='chord_chart',
            instrument='Guitar',
            skill_level='beginner'
        )
        
        # Filter by Piano
        response = client.get('/api/resources/library/?instrument=Piano')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['instrument'] == 'Piano'

    def test_filter_by_skill_level(self, setup_data):
        """Test filtering resources by skill level"""
        client = APIClient()
        client.force_authenticate(user=setup_data['teacher_user'])
        
        # Create beginner resource
        Resource.objects.create(
            studio=setup_data['studio'],
            uploaded_by=setup_data['teacher_user'],
            title='Beginner Scales',
            resource_type='sheet_music',
            instrument='Piano',
            skill_level='beginner'
        )
        
        # Create advanced resource
        Resource.objects.create(
            studio=setup_data['studio'],
            uploaded_by=setup_data['teacher_user'],
            title='Advanced Sonata',
            resource_type='sheet_music',
            instrument='Piano',
            skill_level='advanced'
        )
        
        # Filter by beginner
        response = client.get('/api/resources/library/?skill_level=beginner')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['skill_level'] == 'beginner'

    def test_search_by_composer(self, setup_data):
        """Test searching resources by composer name"""
        client = APIClient()
        client.force_authenticate(user=setup_data['teacher_user'])
        
        Resource.objects.create(
            studio=setup_data['studio'],
            uploaded_by=setup_data['teacher_user'],
            title='Moonlight Sonata',
            resource_type='sheet_music',
            instrument='Piano',
            skill_level='advanced',
            composer='Beethoven'
        )
        
        response = client.get('/api/resources/library/?search=Beethoven')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1
        assert 'Beethoven' in response.data[0]['composer']
