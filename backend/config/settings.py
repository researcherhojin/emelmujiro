from pathlib import Path
import os
import sys
import secrets
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("SECRET_KEY", secrets.token_urlsafe(50))

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get("DEBUG", "False").lower() == "true"

ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

# Add testserver for Django test client
if "test" in sys.argv:
    ALLOWED_HOSTS.append("testserver")
    # Disable SSL redirect during tests
    SECURE_SSL_REDIRECT = False

# Application definition
CUSTOM_APPS = [
    "rest_framework",
    "corsheaders",
    "api",
]

SYSTEMS_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

INSTALLED_APPS = CUSTOM_APPS + SYSTEMS_APPS

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # 정적 파일 보안
    # "api.middleware.SecurityMiddleware",  # 커스텀 보안 미들웨어 (임시 비활성화)
    # "api.middleware.APIResponseTimeMiddleware",  # 응답 시간 모니터링 (임시 비활성화)
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    # "api.middleware.ContentSecurityMiddleware",  # CSP 헤더 (임시 비활성화)
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {
            "min_length": 12,  # 최소 12자로 강화
        },
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Internationalization
LANGUAGE_CODE = "ko-kr"
TIME_ZONE = "Asia/Seoul"
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = "static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

# 정적 파일 압축 (WhiteNoise)
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# URL 처리 설정
APPEND_SLASH = True  # URL 끝에 슬래시 자동 추가

# CORS 설정
CORS_ALLOWED_ORIGINS = os.environ.get(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://192.168.0.80:3000,https://researcherhojin.github.io",
).split(",")

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

# 보안 헤더 설정
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = "DENY"
    SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"

# CSRF 보호 강화
CSRF_COOKIE_SECURE = False if DEBUG else True
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_AGE = 3600  # 1시간

# 세션 보안 강화
SESSION_COOKIE_SECURE = False if DEBUG else True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"

# JWT 설정
from datetime import timedelta

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "VERIFYING_KEY": None,
    "AUDIENCE": None,
    "ISSUER": None,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "TOKEN_TYPE_CLAIM": "token_type",
    "JTI_CLAIM": "jti",
    "SLIDING_TOKEN_REFRESH_EXP_CLAIM": "refresh_exp",
    "SLIDING_TOKEN_LIFETIME": timedelta(minutes=5),
    "SLIDING_TOKEN_REFRESH_LIFETIME": timedelta(days=1),
}

# REST Framework 설정
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 10,
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
        "rest_framework.parsers.MultiPartParser",
        "rest_framework.parsers.FormParser",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {"anon": "100/hour", "user": "1000/hour"},
}

# Swagger 설정
SWAGGER_SETTINGS = {
    "SECURITY_DEFINITIONS": {
        "Bearer": {"type": "apiKey", "name": "Authorization", "in": "header"}
    },
    "USE_SESSION_AUTH": False,
    "JSON_EDITOR": True,
    "OPERATIONS_SORTER": "alpha",
    "TAGS_SORTER": "alpha",
    "DOC_EXPANSION": "none",
    "DEEP_LINKING": True,
    "SHOW_EXTENSIONS": True,
    "DEFAULT_MODEL_RENDERING": "model",
}
SESSION_COOKIE_AGE = 3600  # 1시간
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
SESSION_SAVE_EVERY_REQUEST = True

# HTTPS 설정 (프로덕션)
if not DEBUG:
    SECURE_HSTS_SECONDS = int(os.environ.get("SECURE_HSTS_SECONDS", 31536000))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = (
        os.environ.get("SECURE_HSTS_INCLUDE_SUBDOMAINS", "True").lower() == "true"
    )
    SECURE_HSTS_PRELOAD = (
        os.environ.get("SECURE_HSTS_PRELOAD", "True").lower() == "true"
    )
    SECURE_SSL_REDIRECT = (
        os.environ.get("SECURE_SSL_REDIRECT", "True").lower() == "true"
    )
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
else:
    # 개발 환경에서는 모든 HTTPS 관련 설정 비활성화
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False

# 파일 업로드 보안
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
FILE_UPLOAD_PERMISSIONS = 0o644
ALLOWED_UPLOAD_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".pdf", ".doc", ".docx"]

# 이메일 설정
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"

EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True

EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD")

# 이메일 발송 설정
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER
ADMIN_EMAIL = "researcherhojin@gmail.com"
EMAIL_TIMEOUT = 5
EMAIL_MAX_RETRIES = 3

# reCAPTCHA 설정
RECAPTCHA_PUBLIC_KEY = os.environ.get("RECAPTCHA_PUBLIC_KEY")
RECAPTCHA_PRIVATE_KEY = os.environ.get("RECAPTCHA_PRIVATE_KEY")

# 캐시 설정 (Redis 사용 권장, 개발 시에는 로컬 메모리)
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique-snowflake",
        "TIMEOUT": 300,
        "OPTIONS": {
            "MAX_ENTRIES": 1000,
        },
    }
}

# REST Framework 설정
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 10,
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",
        "user": "1000/hour",
        "contact": "5/hour",
        "newsletter": "3/hour",
    },
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
        "rest_framework.parsers.FormParser",
        "rest_framework.parsers.MultiPartParser",
    ],
}

# 로깅 설정
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
        "simple": {
            "format": "{levelname} {message}",
            "style": "{",
        },
        "security": {
            "format": "[SECURITY] {levelname} {asctime} {module} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "simple",
        },
        "file": {
            "class": "logging.FileHandler",
            "filename": os.path.join(BASE_DIR, "debug.log"),
            "formatter": "verbose",
        },
        "security_file": {
            "class": "logging.FileHandler",
            "filename": os.path.join(BASE_DIR, "security.log"),
            "formatter": "security",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": True,
        },
        "api": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
        "security": {
            "handlers": ["console", "security_file"],
            "level": "WARNING",
            "propagate": False,
        },
    },
}

# 개발 모드에서만 허용되는 설정들
if DEBUG:
    # 개발 도구
    INSTALLED_APPS += ["django_extensions"]

    # 개발 모드에서만 허용되는 CORS 설정
    CORS_ALLOW_ALL_ORIGINS = True
else:
    # 프로덕션 모드에서 추가 보안 설정
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

    # 프로덕션에서는 모든 로그를 파일로
    LOGGING["loggers"]["django"]["level"] = "WARNING"
    LOGGING["loggers"]["api"]["level"] = "WARNING"

# 테스트 환경에서는 SSL 리다이렉트 비활성화 (재확인)
if "test" in sys.argv:
    SECURE_SSL_REDIRECT = False
