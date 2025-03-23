"""
ProdxCloud Multi-tenant SaaS Platform
====================================

Copyright (c) 2024 ProdxCloud.io
All rights reserved.

This source code is licensed under the terms of the MIT license.
See LICENSE file in the project root for details.

Django settings for multitenantsaas project.
For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/
"""

import os
import datetime
import socket
from datetime import timedelta
from pathlib import Path
from decouple import config
from unipath import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

#######################
# PATH CONFIGURATION
#######################

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent
CORE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE_DIR = os.path.join(CORE_DIR, "apps/templates")  # ROOT dir for templates

#######################
# CORE CONFIGURATION
#######################

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default=os.environ.get("DJANGO_SECRET_KEY", "54g6s%qjfnhbpw0zeoei=$!her*y(p%!&84rs$4l85io"))

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=True, cast=bool)

# Site ID (required for django.contrib.sites)
SITE_ID = 1

# Root URL Configuration
ROOT_URLCONF = 'multitenantsaas.urls'

# WSGI Application
WSGI_APPLICATION = 'multitenantsaas.wsgi.application'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

#######################
# HOST CONFIGURATION
#######################

ALLOWED_HOSTS = ['*']

# Debug toolbar configuration
if DEBUG:
    hostname, _, ips = socket.gethostbyname_ex(socket.gethostname())
    INTERNAL_IPS = [ip[: ip.rfind(".")] + ".1" for ip in ips] + ["10.0.2.2", "host.docker.internal", "api.prodxcloud.io"]

#######################
# CORS CONFIGURATION
#######################

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Frontend development server
]

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
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods',
]

#######################
# APP CONFIGURATION
#######################

DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'debug_toolbar',
    'django_extensions',
    'django_celery_results',
    'django_celery_beat',
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'drf_yasg',
    'widget_tweaks',
    'allauth',
    'allauth.account',
    'django_ledger',
    'data_browser',
    'template_timings_panel',
]

LOCAL_APPS = [
    'apps.snippets',
    'apps.users',
    'apps.finances',
    'apps.payments',
    'apps.products',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

#######################
# MIDDLEWARE CONFIGURATION
#######################

MIDDLEWARE = [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]

#######################
# DEBUG CONFIGURATION
#######################

DEBUG_TOOLBAR_PANELS = [
    'debug_toolbar.panels.versions.VersionsPanel',
    'debug_toolbar.panels.settings.SettingsPanel',
    'debug_toolbar.panels.staticfiles.StaticFilesPanel',
    'debug_toolbar.panels.timer.TimerPanel',
    'debug_toolbar.panels.headers.HeadersPanel',
    'debug_toolbar.panels.request.RequestPanel',
    'debug_toolbar.panels.sql.SQLPanel',
    'debug_toolbar.panels.cache.CachePanel',
    'debug_toolbar.panels.profiling.ProfilingPanel',
    'debug_toolbar.panels.history.HistoryPanel',
    'template_timings_panel.panels.TemplateTimings.TemplateTimings',
]

DEBUG_TOOLBAR_CONFIG = {
    'SHOW_TOOLBAR_CALLBACK': lambda request: DEBUG
}

#######################
# TEMPLATE CONFIGURATION
#######################

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [TEMPLATE_DIR],
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

#######################
# DATABASE CONFIGURATION
#######################

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': 'db.sqlite3',
    }
}

#######################
# AUTHENTICATION CONFIGURATION
#######################

AUTH_USER_MODEL = "users.User"
ACCOUNT_ADAPTER = 'apps.users.adapter.MyAccountAdapter'
ACCOUNT_LOGIN_METHODS = {'email'}
ACCOUNT_EMAIL_VERIFICATION = False
ACCOUNT_CONFIRM_EMAIL_ON_GET = True
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_UNIQUE_EMAIL = True

AUTHENTICATION_BACKENDS = (
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
)

# JWT Settings
REST_USE_JWT = True
JWT_AUTH_COOKIE = "jwt-auth"
JWT_VERIFY_EXPIRATION = False

SIMPLE_JWT = {
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': False,
    'ALGORITHM': 'HS256',
    'VERIFYING_KEY': None,
    'ACCESS_TOKEN_LIFETIME': datetime.timedelta(days=2),
    'REFRESH_TOKEN_LIFETIME': datetime.timedelta(days=5),
}

#######################
# REST FRAMEWORK CONFIGURATION
#######################

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "dj_rest_auth.jwt_auth.JWTCookieAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_FILTER_BACKENDS": ["django_filters.rest_framework.DjangoFilterBackend"],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
    "COERCE_DECIMAL_TO_STRING": False,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

#######################
# INTERNATIONALIZATION
#######################

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

#######################
# STATIC FILES CONFIGURATION
#######################

# Static files (CSS, JavaScript, Images)
STATIC_URL = "static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Base static directory in apps folder
STATIC_BASE = os.path.join(CORE_DIR, 'apps/static')

STATICFILES_DIRS = (
    STATIC_BASE,
)

# Media files (User uploaded content)
MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(STATIC_BASE, 'media')

# Ensure Django serves files in debug mode
if DEBUG:
    SERVE_MEDIA_FILES = True

#######################
# EMAIL CONFIGURATION
#######################

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'email-smtp.us-east-1.amazonaws.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='')

#######################
# CACHE CONFIGURATION
#######################

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

#######################
# CELERY CONFIGURATION
#######################

CELERY_BROKER_URL = 'redis://127.0.0.1:6379/0'
CELERY_RESULT_BACKEND = 'redis://127.0.0.1:6379/0'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'

#######################
# LOGGING CONFIGURATION
#######################

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join('django_debug.log'),
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': True,
        },
        'django.request': {
            'handlers': ['console', 'file'],
            'level': 'ERROR',
            'propagate': False,
        },
        'finances': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

#######################
# THIRD-PARTY APPS CONFIGURATION
#######################

# Stripe Configuration
STRIPE_SECRET_KEY = config('STRIPE_SECRET_KEY', default=os.environ.get("STRIPE_SECRET_KEY"))
STRIPE_PUBLISHABLE_KEY = config('STRIPE_PUBLISHABLE_KEY', default=os.environ.get("STRIPE_PUBLISHABLE_KEY"))
STRIPE_WEBHOOK_SECRET = config('STRIPE_WEBHOOK_SECRET', default=os.environ.get("STRIPE_WEBHOOK_SECRET"))

# Frontend URLs
FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:3000')
STRIPE_SUCCESS_URL = config('STRIPE_SUCCESS_URL', default=FRONTEND_URL + '/checkout/success')
STRIPE_CANCEL_URL = config('STRIPE_CANCEL_URL', default=FRONTEND_URL + '/checkout/cancel')

# Backend URLs
BACKEND_DOMAIN = config('BACKEND_DOMAIN', default='http://api.prodxcloud.io/')
PAYMENT_SUCCESS_URL = config('PAYMENT_SUCCESS_URL', default=BACKEND_DOMAIN + 'api/v1/products/success/')
PAYMENT_CANCEL_URL = config('PAYMENT_CANCEL_URL', default=BACKEND_DOMAIN + 'api/v1/products/cancel/')

# Coinbase Configuration
COINBASE_API_KEY = config('COINBASE_API_KEY', default=os.environ.get("COINBASE_API_KEY"))
COINBASE_API_KEY_NAME = config('COINBASE_API_KEY_NAME', default=os.environ.get("COINBASE_API_KEY_NAME"))

# Bitcoin Configuration
BTC_API_URL = config('BTC_API_URL', default=os.environ.get("BTC_API_URL"))

# Web3 Configuration
INFURA_URL = config('INFURA_URL', default=os.environ.get("INFURA_URL"))
BLP_SALE_CONTRACT_ADDRESS = config('BLP_SALE_CONTRACT_ADDRESS', default=os.environ.get("BLP_SALE_CONTRACT_ADDRESS"))
CHAIN_ID = config('CHAIN_ID', default=os.environ.get("CHAIN_ID", 1), cast=int)

# Google OAuth2 Configuration
GOOGLE_OAUTH2_CLIENT_ID = config('GOOGLE_OAUTH2_CLIENT_ID', default='')
GOOGLE_OAUTH2_CLIENT_SECRET = config('GOOGLE_OAUTH2_CLIENT_SECRET', default='')

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"