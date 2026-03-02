import mimetypes
import os

from django.conf import settings
from django.core.exceptions import ValidationError


# Extension → allowed MIME types mapping
EXTENSION_MIME_MAP = {
    ".jpg": {"image/jpeg"},
    ".jpeg": {"image/jpeg"},
    ".png": {"image/png"},
    ".gif": {"image/gif"},
    ".pdf": {"application/pdf"},
    ".doc": {"application/msword"},
    ".docx": {"application/vnd.openxmlformats-officedocument.wordprocessingml.document"},
}


def validate_uploaded_file(file):
    """Validate uploaded file: extension, MIME type, and size."""
    _validate_extension(file.name)
    _validate_mime_type(file)
    _validate_file_size(file)


def _validate_extension(filename):
    """Case-insensitive extension check against ALLOWED_UPLOAD_EXTENSIONS."""
    ext = os.path.splitext(filename)[1].lower()
    allowed = [e.lower() for e in settings.ALLOWED_UPLOAD_EXTENSIONS]
    if ext not in allowed:
        raise ValidationError(
            f"허용되지 않는 파일 형식입니다: {ext}. "
            f"허용 형식: {', '.join(allowed)}"
        )


def _validate_mime_type(file):
    """Verify MIME type matches extension using mimetypes module."""
    ext = os.path.splitext(file.name)[1].lower()
    allowed_mimes = EXTENSION_MIME_MAP.get(ext)
    if allowed_mimes is None:
        return  # Extension not in map — skip MIME check

    # Guess from filename
    guessed_type, _ = mimetypes.guess_type(file.name)

    # Also try reading content type from the uploaded file
    content_type = getattr(file, "content_type", None)

    if content_type and content_type not in allowed_mimes:
        raise ValidationError(
            f"파일 MIME 타입이 확장자와 일치하지 않습니다. "
            f"확장자: {ext}, MIME: {content_type}"
        )

    if guessed_type and guessed_type not in allowed_mimes:
        raise ValidationError(
            f"파일 MIME 타입이 확장자와 일치하지 않습니다. "
            f"확장자: {ext}, 추정 MIME: {guessed_type}"
        )


def _validate_file_size(file):
    """Check file size against FILE_UPLOAD_MAX_MEMORY_SIZE."""
    max_size = getattr(settings, "FILE_UPLOAD_MAX_MEMORY_SIZE", 5242880)
    if file.size > max_size:
        max_mb = max_size / (1024 * 1024)
        file_mb = file.size / (1024 * 1024)
        raise ValidationError(
            f"파일 크기가 제한을 초과합니다. "
            f"최대: {max_mb:.0f}MB, 현재: {file_mb:.1f}MB"
        )
