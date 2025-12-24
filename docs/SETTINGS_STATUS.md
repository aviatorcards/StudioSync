# Settings Functionality Status

## ✅ What's Currently Working

### Profile Settings
- **Load**: ✅ Working - Data loads from `useUser()` context which calls `/core/users/me/`
- **Save**: ✅ Working - Calls `PATCH /core/users/me/` with updated profile data
- **Fields Saved**: first_name, last_name, phone, bio, instrument

### Avatar Upload  
- **Backend Support**: ✅ Yes - `User` model has `avatar = models.FileField(upload_to='avatars/', blank=True, null=True)`
- **Serializer**: ✅ Included in `UserSerializer` fields
- **Frontend**: ✅ Calls `PATCH /core/users/me/` with FormData
- **Status**: Should be working, but may fail if:
  - Media files not configured in Django settings
  - Upload directory permissions issue
  - CORS blocking file uploads

## ❌ What's NOT Working

### Studio Settings
- **Current State**: Only shows success toast
- **Backend Needed**: Studio model exists, but needs endpoint configuration
- **Fix Needed**: Connect to `/api/studios/{id}/` or create new settings endpoint

### Communication Settings
- **Current State**: Only shows success toast  
- **Backend Needed**: No dedicated preference/settings model
- **Options**:
  1. Add JSON field to User model for preferences
  2. Create separate UserPreferences model
  3. Use existing `preferences` field on User model

### Appearance Settings
- **Current State**: Only shows success toast
- **Backend Needed**: Store in user preferences
- **Fix Needed**: Save to `User.preferences` JSON field

### Notifications Settings
- **Current State**: Only shows success toast
- **Backend Needed**: Store in user preferences  
- **Fix Needed**: Save to `User.preferences` JSON field

### Technical Settings (SMTP/SMS)
- **Current State**: Only shows success toast
- **Backend Needed**: Studio-level settings or global config
- **Security**: Should be encrypted in database
- **Fix Needed**: Create StudioSettings or SystemConfig model

## 🔧 How to Fix

### Option 1: Use User.preferences JSON Field (Quickest)
The User model already has a `preferences` JSONField. We can store all settings there:

```python
# User model already has:
preferences = models.JSONField(default=dict, blank=True)
```

Frontend can save like:
```typescript
api.patch('/core/users/me/', {
    preferences: {
        ...currentUser.preferences,
        communication: commSettings,
        appearance: appearanceSettings,
        notifications: notifSettings
    }
})
```

### Option 2: Create Dedicated Models (Better for Production)

```python
class UserPreferences(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # Communication
    email_lessons = models.BooleanField(default=True)
    email_messages = models.BooleanField(default=True)
    sms_reminders = models.BooleanField(default=True)
    # Appearance  
    theme = models.CharField(max_length=20, default='light')
    font_size = models.CharField(max_length=20, default='medium')
    # ... etc

class StudioTechnicalSettings(models.Model):
    studio = models.OneToOneField(Studio, on_delete=models.CASCADE)
    # SMTP
    smtp_host = models.CharField(max_length=255, blank=True)
    smtp_port = models.IntegerField(default=587)
    smtp_password = models.CharField(max_length=255, blank=True)  # Should be encrypted!
    # SMS
    sms_provider = models.CharField(max_length=50, default='twilio')
    sms_auth_token = models.CharField(max_length=255, blank=True)  # Should be encrypted!
```

##  Quick Fix for Avatar Upload

If avatar upload isn't working, check:

1. **Django settings.py**:
```python
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

2. **urls.py** (development):
```python
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ... your urls
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

3. **Directory permissions**:
```bash
mkdir -p media/avatars
chmod 755 media media/avatars
```

4. **Serializer update handling**:
Make sure the serializer properly handles file uploads in the `update()` method.

## Testing Avatar Upload

Open browser console and try:
```javascript
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const formData = new FormData();
  formData.append('avatar', file);
  
  try {
    const response = await fetch('/api/core/users/me/', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData  // Don't set Content-Type header!
    });
    console.log(await response.json());
  } catch (error) {
    console.error('Upload failed:', error);
  }
});
```

## Recommended Next Steps

1. ✅ **Immediate**: Add console.error logging to avatar upload to see actual error
2. ✅ **Quick Win**: Use `User.preferences` JSON field for settings
3. 🔄 **Phase 2**: Create dedicated models for better data structure
4. 🔒 **Security**: Encrypt SMTP/SMS credentials before production
