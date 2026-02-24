"""
Django settings for Music Studio Manager
"""
import dj_database_url
import os
from pathlib import Path
from datetime import timedelta

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# Security settings
SECRET_KEY = os.getenv('SECRET_KEY')
DEBUG = os.getenv('DEBUG', 'False') == 'True'
# Normalize ALLOWED_HOSTS: strip whitespace and filter empty values
ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')
    if host.strip()
]
if DEBUG:
    ALLOWED_HOSTS = ['*']

# Production Security
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')


# Site configuration
SITE_NAME = os.getenv('SITE_NAME', 'StudioSync')
FRONTEND_BASE_URL = os.getenv('FRONTEND_BASE_URL', 'http://localhost:3000')

# Application definition
INSTALLED_APPS = [
    # Admin theme (must be before django.contrib.admin)
    'daphne',
    'jazzmin',
    
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'drf_spectacular',
    'corsheaders',
    'django_q',
    'channels',
    
    # Local apps
    'apps.core',
    'apps.auth',
    'apps.students',
    'apps.lessons',
    'apps.billing',
    'apps.resources',
    'apps.messaging',
    'apps.inventory',
    'apps.notifications',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# Database
DATABASES = {
    'default': dj_database_url.config(
        default=f'sqlite:///{BASE_DIR / "db.sqlite3"}',
        conn_max_age=600
    )
}

# Custom User Model
AUTH_USER_MODEL = 'core.User'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files (user uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# File Upload Security Settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
FILE_UPLOAD_PERMISSIONS = 0o644
FILE_UPLOAD_DIRECTORY_PERMISSIONS = 0o755

# Allowed file extensions for uploads
ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt']
ALLOWED_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.ogg']
ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.webm']

# Maximum file sizes (in bytes)
MAX_AVATAR_SIZE = 5 * 1024 * 1024  # 5MB
MAX_DOCUMENT_SIZE = 10 * 1024 * 1024  # 10MB
MAX_MEDIA_SIZE = 50 * 1024 * 1024  # 50MB

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS settings
CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000,http://127.0.0.1:3000'
).split(',')

if DEBUG:
    # In dev, allow CORS from anywhere to make remote testing easier
    CORS_ALLOW_ALL_ORIGINS = True
else:
    CORS_ALLOW_ALL_ORIGINS = False

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
CORS_EXPOSE_HEADERS = [
    'content-type',
    'authorization',
]
CORS_PREFLIGHT_MAX_AGE = 86400  # 24 hours

# APPEND_SLASH=False: Django's auto-redirect to add trailing slashes causes
# a redirect loop when requests go through the Next.js proxy (the proxy strips
# the slash, Django redirects to the slash URL, repeat). Trailing slashes are
# handled instead by using optional-slash URL patterns in each app's urls.py.
APPEND_SLASH = False

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# API Documentation (drf-spectacular)
SPECTACULAR_SETTINGS = {
    'TITLE': 'StudioSync API',
    'DESCRIPTION': 'API for Music Studio Management System',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
}

# JWT settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# Database Caching
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
        'LOCATION': 'cache_table',
    }
}

# Background Tasks (Django Q with Postgres)
Q_CLUSTER = {
    'name': 'StudioSyncQueue',
    'workers': 4,
    'recycle': 500,
    'timeout': 60,
    'compress': True,
    'save_limit': 250,
    'queue_limit': 500,
    'label': 'Django Q',
    'orm': 'default', # Use Postgres (default DB)
}

# Channels settings (Single-node/In-memory)
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}

### Docs??? 

# Email Configuration (Uses custom backend to read from DB)
EMAIL_BACKEND = 'apps.core.email_backend.ParameterizedEmailBackend'
EMAIL_HOST = 'smtp.example.com' 
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'dummy'
EMAIL_HOST_PASSWORD = 'dummy'
DEFAULT_FROM_EMAIL = 'noreply@studiosync.com'

# Stripe Payments
STRIPE_PUBLISHABLE_KEY = os.getenv('STRIPE_PUBLISHABLE_KEY', '')
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY', '')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET', '')

# Twilio settings
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID', '')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN', '')
TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER', '')

# MinIO/S3/R2 settings
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID') or os.getenv('MINIO_ACCESS_KEY', 'minio_admin')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY') or os.getenv('MINIO_SECRET_KEY', 'minio_password')
AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME') or os.getenv('MINIO_BUCKET', 'music-studio')

# Endpoint Configuration
AWS_S3_ENDPOINT_URL = os.getenv('AWS_S3_ENDPOINT_URL')
if AWS_S3_ENDPOINT_URL:
    # Production/R2 Mode
    AWS_S3_USE_SSL = os.getenv('AWS_S3_USE_SSL', 'True') == 'True'
else:
    # Local/MinIO Mode
    AWS_S3_ENDPOINT_URL = f"http://{os.getenv('MINIO_ENDPOINT', 'minio:9000')}"
    AWS_S3_USE_SSL = False

AWS_DEFAULT_ACL = 'private'
AWS_QUERYSTRING_AUTH = True
AWS_S3_FILE_OVERWRITE = False
AWS_S3_SIGNATURE_VERSION = 's3v4'
AWS_S3_REGION_NAME = 'auto'  # R2 prefers auto in many cases to avoid 301 recursion
AWS_S3_ADDRESSING_STYLE = 'path'
# AWS_S3_OBJECT_PARAMETERS = {
#     'CacheControl': 'max-age=86400',
# }


# File upload settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 50 * 1024 * 1024  # 50MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 50 * 1024 * 1024  # 50MB

# Storages
# Storages
if os.getenv('AWS_ACCESS_KEY_ID'):
    STORAGES = {
        "default": {
            "BACKEND": "apps.core.storage.R2Storage",
        },
        "staticfiles": {
            "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
        },
    }
else:
    STORAGES = {
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
        },
        "staticfiles": {
            "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
        },
    }

# Jazzmin Admin Theme Configuration
from config.jazzmin_settings import JAZZMIN_SETTINGS, JAZZMIN_UI_TWEAKS
