import mimetypes
import os
import struct
import warnings

from django.conf import settings
from django.core.exceptions import ValidationError
from PIL import Image, ImageSequence

IMAGE_FORMATS = {".jpg": "JPEG", ".jpeg": "JPEG", ".png": "PNG", ".gif": "GIF"}
MAX_IMAGE_PIXELS = 16_000_000
MAX_IMAGE_TOTAL_PIXELS = 32_000_000
MAX_IMAGE_FRAMES = 100

# Set one process-wide policy at import, before any decoder can allocate memory.
# Per-request global changes would race between gunicorn threads.
Image.MAX_IMAGE_PIXELS = MAX_IMAGE_PIXELS
warnings.filterwarnings("error", category=Image.DecompressionBombWarning)


def validate_uploaded_image(file):
    """Decode allowed image formats with bounded dimensions and animation work."""
    validate_uploaded_file(file)
    expected_format = IMAGE_FORMATS.get(os.path.splitext(file.name)[1].lower())
    if expected_format is None:
        raise ValidationError("이미지 파일(JPEG, PNG, GIF)만 업로드할 수 있습니다.")

    try:
        file.seek(0)
        with Image.open(file, formats=[expected_format]) as image:
            image.verify()
        file.seek(0)
        with Image.open(file, formats=[expected_format]) as image:
            total_pixels = 0
            for index, frame in enumerate(ImageSequence.Iterator(image)):
                pixels = frame.width * frame.height
                total_pixels += pixels
                if index >= MAX_IMAGE_FRAMES or pixels > MAX_IMAGE_PIXELS or total_pixels > MAX_IMAGE_TOTAL_PIXELS:
                    raise ValidationError("이미지 해상도 또는 애니메이션 크기가 제한을 초과합니다.")
                frame.load()
    except (
        OSError,
        ValueError,
        SyntaxError,
        IndexError,
        struct.error,
        Image.DecompressionBombError,
        Image.DecompressionBombWarning,
    ) as exc:
        raise ValidationError("유효하지 않거나 손상된 이미지 파일입니다.") from exc
    finally:
        # Validation must not leave the stream consumed before storage.
        file.seek(0)


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
        raise ValidationError(f"허용되지 않는 파일 형식입니다: {ext}. " f"허용 형식: {', '.join(allowed)}")


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
        raise ValidationError(f"파일 MIME 타입이 확장자와 일치하지 않습니다. " f"확장자: {ext}, MIME: {content_type}")

    if guessed_type and guessed_type not in allowed_mimes:
        raise ValidationError(
            f"파일 MIME 타입이 확장자와 일치하지 않습니다. " f"확장자: {ext}, 추정 MIME: {guessed_type}"
        )


def _validate_file_size(file):
    """Check file size against FILE_UPLOAD_MAX_MEMORY_SIZE."""
    max_size = getattr(settings, "FILE_UPLOAD_MAX_MEMORY_SIZE", 5242880)
    if file.size > max_size:
        max_mb = max_size / (1024 * 1024)
        file_mb = file.size / (1024 * 1024)
        raise ValidationError(f"파일 크기가 제한을 초과합니다. " f"최대: {max_mb:.0f}MB, 현재: {file_mb:.1f}MB")
