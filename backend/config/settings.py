"""
Django settings for dormitory management backend.
"""

import os
from datetime import timedelta
from pathlib import Path
from urllib.parse import urlparse

BASE_DIR = Path(__file__).resolve().parent.parent
# Resolve the repository/project root in a container-safe way.
# - In this repository, BASE_DIR points to /workspace/backend.
# - We default to BASE_DIR.parent (/workspace) so logs are stored at project root.
# - PROJECT_ROOT can be overridden via env var for custom deployment layouts.
PROJECT_ROOT = Path(
    os.environ.get('PROJECT_ROOT', str(BASE_DIR.parent))
).expanduser().resolve()

# Centralized logs directory for all runtime logs.
# mkdir(..., exist_ok=True) guarantees startup does not fail when the directory
# already exists, and parents=True handles nested path creation safely.
LOGS_DIR = PROJECT_ROOT / 'logs'
LOGS_DIR.mkdir(parents=True, exist_ok=True)

SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-only-secret-key-change-in-production')
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1,backend').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'drf_spectacular',
    'graphene_django',
    'core',
    'users',
    'dorms',
    'requests_app',
    'classes',
    'ideas',
    'announcements',
    'dormitory',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # Request lifecycle logging middleware (status codes, duration, client/user metadata).
    'core.middleware.ApiRequestLoggingMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

AUTH_USER_MODEL = 'users.User'


def _database_from_url(database_url):
    parsed = urlparse(database_url)
    return {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': parsed.path.lstrip('/'),
        'USER': parsed.username,
        'PASSWORD': parsed.password,
        'HOST': parsed.hostname,
        'PORT': parsed.port or '5432',
        'OPTIONS': {'connect_timeout': 10},
    }


DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    DATABASES = {'default': _database_from_url(DATABASE_URL)}
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('POSTGRES_DB', 'dormitory_db'),
            'USER': os.environ.get('POSTGRES_USER', 'dormitory_user'),
            'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'dormitory_pass'),
            'HOST': os.environ.get('POSTGRES_HOST', 'db'),
            'PORT': os.environ.get('POSTGRES_PORT', '5432'),
            'OPTIONS': {'connect_timeout': 10},
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'fa-ir'
TIME_ZONE = 'Asia/Tehran'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        'CORS_ALLOWED_ORIGINS',
        'http://localhost:3000,http://frontend:3000',
    ).split(',')
    if origin.strip()
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    # Route DRF errors through a central handler that logs full tracebacks while
    # returning sanitized responses for unexpected internal failures.
    'EXCEPTION_HANDLER': 'core.exception_handler.custom_exception_handler',
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'LEEWAY': 0,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': (
        'rest_framework_simplejwt.authentication.default_user_authentication_rule'
    ),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'JTI_CLAIM': 'jti',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Dormitory Management API',
    'DESCRIPTION': 'API documentation for the Dormitory Management System',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'TAGS': [
        {'name': 'Authentication', 'description': 'ورود، خروج و مدیریت توکن'},
        {'name': 'Requests', 'description': 'درخواست‌های خوابگاه'},
        {'name': 'Classes', 'description': 'ثبت‌نام و امتیازدهی کلاس‌ها'},
        {'name': 'Ideas', 'description': 'ثبت و رأی‌دهی به ایده‌ها'},
        {'name': 'Complaints', 'description': 'ثبت و پیگیری شکایات'},
        {'name': 'Suggestions', 'description': 'ثبت و پیگیری پیشنهادات'},
    ],
}

GRAPHENE = {
    'SCHEMA': 'dormitory.schema.schema',
}

# Django logging configuration
# Reference: https://docs.djangoproject.com/en/stable/topics/logging/
LOGGING = {
    # Logging config schema version required by Python's logging.config.dictConfig.
    'version': 1,
    # Keep Django/default library loggers active unless explicitly overridden.
    'disable_existing_loggers': False,
    # Reusable log message formats used by handlers below.
    'formatters': {
        # Verbose formatter for file logs and console debugging.
        # Includes timestamp, severity, logger name, source location,
        # process/thread IDs, and message text.
        'verbose': {
            'format': (
                '[{asctime}] {levelname} {name} '
                '({module}.{funcName}:{lineno}) '
                '[pid:{process} tid:{thread}] - {message}'
            ),
            'style': '{',
        },
    },
    # Output destinations for log records.
    'handlers': {
        # Development-friendly console logging for quick local diagnostics.
        'console': {
            'class': 'logging.StreamHandler',
            'level': 'DEBUG' if DEBUG else 'INFO',
            'formatter': 'verbose',
        },
        # Rotating app log (INFO and above) for operational visibility.
        # Rotation prevents unbounded disk growth.
        'app_file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'level': 'INFO',
            'formatter': 'verbose',
            'filename': str(LOGS_DIR / 'app.log'),
            'maxBytes': 10 * 1024 * 1024,  # 10 MB per file
            'backupCount': 5,  # Keep 5 rolled files
            'encoding': 'utf-8',
        },
        # Rotating error log (ERROR and above) for incidents and tracebacks.
        'error_file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'level': 'ERROR',
            'formatter': 'verbose',
            'filename': str(LOGS_DIR / 'error.log'),
            'maxBytes': 10 * 1024 * 1024,  # 10 MB per file
            'backupCount': 5,  # Keep 5 rolled files
            'encoding': 'utf-8',
        },
    },
    # Logger routing rules by namespace.
    'loggers': {
        # Django core logs (startup/runtime messages and framework events).
        'django': {
            'handlers': ['console', 'app_file', 'error_file'],
            'level': 'INFO',
            'propagate': False,
        },
        # Unhandled request exceptions (500s) emitted by Django request cycle.
        'django.request': {
            'handlers': ['console', 'app_file', 'error_file'],
            'level': 'ERROR',
            'propagate': False,
        },
        # HTTP server/runtime errors from Django's server logger.
        'django.server': {
            'handlers': ['console', 'app_file', 'error_file'],
            'level': 'ERROR',
            'propagate': False,
        },
        # Database backend errors (query/connection failures).
        'django.db.backends': {
            'handlers': ['console', 'app_file', 'error_file'],
            'level': 'ERROR',
            'propagate': False,
        },
        # DRF and API-layer exceptions, including custom handler emissions.
        'rest_framework': {
            'handlers': ['console', 'app_file', 'error_file'],
            'level': 'INFO',
            'propagate': False,
        },
        # Access logs for normal request/response lifecycle entries.
        'api.access': {
            'handlers': ['console', 'app_file', 'error_file'],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': False,
        },
        # Authentication lifecycle logs (login/logout/token events).
        'auth': {
            'handlers': ['console', 'app_file', 'error_file'],
            'level': 'INFO',
            'propagate': False,
        },
        # Security-focused logs (authentication/authorization failures).
        'security': {
            'handlers': ['console', 'app_file', 'error_file'],
            'level': 'INFO',
            'propagate': False,
        },
        # Built-in Django security-related events (CSRF, suspicious operations, etc.).
        'django.security': {
            'handlers': ['console', 'app_file', 'error_file'],
            'level': 'WARNING',
            'propagate': False,
        },
    },
    # Root logger catches anything not matched above.
    'root': {
        'handlers': ['console', 'app_file', 'error_file'],
        'level': 'INFO',
    },
}
