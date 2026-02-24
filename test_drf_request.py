from django.test import RequestFactory
from rest_framework.request import Request
from rest_framework.parsers import MultiPartParser
from django.core.files.uploadedfile import SimpleUploadedFile

factory = RequestFactory()
file = SimpleUploadedFile("avatar.jpg", b"fake image", content_type="image/jpeg")
request = factory.post("/api/core/users/me/", {"avatar": file}, format="multipart")

drf_request = Request(request, parsers=[MultiPartParser()])
data = drf_request.data

print("Data type:", type(data))
try:
    data.pop('avatar')
    print("Pop successful!")
except Exception as e:
    print("Pop failed:", repr(e))

avatar_val = data.get('avatar')
print("Type of get('avatar'):", type(avatar_val))

avatar_list = data.getlist('avatar') if hasattr(data, 'getlist') else None
print("Type of getlist('avatar'):", type(avatar_list))

