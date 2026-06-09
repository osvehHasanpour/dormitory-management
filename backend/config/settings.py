"""
Add/update these settings in your backend/settings.py
to connect Django to PostgreSQL via Docker environment variables.
"""

import os
from pathlib import Path

# ─── Database ─────────────────────────────────────────────────────────
# Replaces the default SQLite config
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB', 'dormitory_db'),
        'USER': os.environ.get('POSTGRES_USER', 'dormitory_user'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'dormitory_pass'),
        'HOST': os.environ.get('POSTGRES_HOST', 'db'),
        'PORT': os.environ.get('POSTGRES_PORT', '5432'),
        'OPTIONS': {
            'connect_timeout': 10,
        },
    }
}

# ─── CORS ─────────────────────────────────────────────────────────────
# pip install django-cors-headers
INSTALLED_APPS = [
    # ... your existing apps ...
    'corsheaders',
    'rest_framework',
    'drf_yasg',       # Swagger
    'graphene_django', # GraphQL
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be before CommonMiddleware
    'corsheaders.middleware.CorsMiddleware',
]

CORS_ALLOWED_ORIGINS = os.environ.get(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000'
).split(',')

# ─── REST Framework ───────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# ─── GraphQL ──────────────────────────────────────────────────────────
GRAPHENE = {
    'SCHEMA': 'dormitory.schema.schema',  # adjust to your schema path
}

# ─── Static / Media ───────────────────────────────────────────────────
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ─── Security ─────────────────────────────────────────────────────────
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-only-secret-key')
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost').split(',')
