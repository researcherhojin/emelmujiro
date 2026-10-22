import struct
from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import SimpleTestCase, override_settings
from django.urls import reverse
from PIL import Image
from rest_framework.test import APITestCase

from .validators import validate_uploaded_image


def image_file(fmt="PNG", frames=1):
    output = BytesIO()
    image = Image.new("RGB", (3, 3), "red")
    options = {}
    if frames > 1:
        options = {"save_all": True, "append_images": [Image.new("RGB", (3, 3), "blue")]}
    image.save(output, format=fmt, **options)
    ext = "jpg" if fmt == "JPEG" else fmt.lower()
    mime = "jpeg" if fmt == "JPEG" else fmt.lower()
    return SimpleUploadedFile(f"image.{ext}", output.getvalue(), content_type=f"image/{mime}")


class ImageContentValidationTests(SimpleTestCase):
    def test_supported_formats_and_stream_reset(self):
        for fmt in ("JPEG", "PNG", "GIF"):
            with self.subTest(fmt=fmt):
                file = image_file(fmt)
                original = file.read()
                validate_uploaded_image(file)
                self.assertEqual(file.read(), original)

    def test_valid_animation(self):
        validate_uploaded_image(image_file("GIF", frames=2))

    def test_forged_mime_and_signature(self):
        for content in (b"<script>alert(1)</script>", b"\x89PNG\r\n\x1a\n" + b"x" * 100, b""):
            file = SimpleUploadedFile("fake.png", content, content_type="image/png")
            with self.assertRaises(ValidationError):
                validate_uploaded_image(file)
            self.assertEqual(file.tell(), 0)

    def test_documents_rejected_by_image_endpoint_validator(self):
        file = SimpleUploadedFile("document.pdf", b"%PDF-1.7", content_type="application/pdf")
        with self.assertRaises(ValidationError):
            validate_uploaded_image(file)

    def test_real_format_must_match_extension(self):
        file = image_file("GIF")
        file.name = "image.png"
        file.content_type = "image/png"
        with self.assertRaises(ValidationError):
            validate_uploaded_image(file)

    def test_truncated_image_rejected(self):
        file = image_file()
        file = SimpleUploadedFile("broken.png", file.read()[:40], content_type="image/png")
        with self.assertRaises(ValidationError):
            validate_uploaded_image(file)

    def test_pixel_limit(self):
        with patch("api.validators.MAX_IMAGE_PIXELS", 8), self.assertRaises(ValidationError):
            validate_uploaded_image(image_file())

    def test_truncated_animation_returns_validation_error(self):
        content = image_file("GIF", frames=2).read()
        for length in (54, 63):
            with self.subTest(length=length), self.assertRaises(ValidationError):
                validate_uploaded_image(SimpleUploadedFile("broken.gif", content[:length], content_type="image/gif"))

    def test_total_animation_pixel_limit(self):
        with patch("api.validators.MAX_IMAGE_TOTAL_PIXELS", 9), self.assertRaises(ValidationError):
            validate_uploaded_image(image_file("GIF", frames=2))

    def test_animation_frame_limit(self):
        with patch("api.validators.MAX_IMAGE_FRAMES", 1), self.assertRaises(ValidationError):
            validate_uploaded_image(image_file("GIF", frames=2))

    def test_decompression_warning_rejected(self):
        with patch("PIL.Image.MAX_IMAGE_PIXELS", 5), self.assertRaises(ValidationError):
            validate_uploaded_image(image_file())

    def test_large_gif_rejected_before_disposal_buffer_allocation(self):
        output = BytesIO()
        Image.new("RGB", (3, 3), "red").save(output, format="GIF", disposal=2)
        content = bytearray(output.getvalue())
        content[6:10] = struct.pack("<HH", 5000, 5000)
        descriptor = content.index(b",")
        content[descriptor + 5 : descriptor + 9] = struct.pack("<HH", 5000, 5000)
        file = SimpleUploadedFile("large.gif", bytes(content), content_type="image/gif")
        with patch("PIL.Image.core.fill", side_effect=AssertionError("Allocated before validation")) as allocate:
            with self.assertRaises(ValidationError):
                validate_uploaded_image(file)
            allocate.assert_not_called()

    def test_decompression_error_rejected(self):
        with patch("PIL.Image.MAX_IMAGE_PIXELS", 3), self.assertRaises(ValidationError):
            validate_uploaded_image(image_file())

    @override_settings(FILE_UPLOAD_MAX_MEMORY_SIZE=1)
    def test_size_limit_before_decoding(self):
        with patch("api.validators.Image.open") as decode, self.assertRaises(ValidationError):
            validate_uploaded_image(image_file())
        decode.assert_not_called()


class ImageUploadBoundaryTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser("upload-admin", "upload@example.test", "upload-password")
        self.client.force_authenticate(self.admin)

    def test_forged_upload_creates_no_file(self):
        with TemporaryDirectory() as directory, override_settings(MEDIA_ROOT=directory):
            file = SimpleUploadedFile("fake.png", b"not an image", content_type="image/png")
            response = self.client.post(reverse("blog-image-upload"), {"image": file}, format="multipart")
            self.assertEqual(response.status_code, 400)
            self.assertEqual(list(Path(directory).rglob("*")), [])

    def test_saved_file_is_complete(self):
        with TemporaryDirectory() as directory, override_settings(MEDIA_ROOT=directory):
            file = image_file()
            original = file.read()
            file.seek(0)
            response = self.client.post(reverse("blog-image-upload"), {"image": file}, format="multipart")
            self.assertEqual(response.status_code, 201)
            saved = list(Path(directory).rglob("*.png"))
            self.assertEqual(len(saved), 1)
            self.assertEqual(saved[0].read_bytes(), original)
