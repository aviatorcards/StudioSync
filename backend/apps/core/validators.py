"""
File Upload Validators and Utilities

Provides security validation for all file uploads including:
- File size limits
- File type validation
- Filename sanitization
- Malicious file detection
"""

import mimetypes
import os

from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils.deconstruct import deconstructible


@deconstructible
class FileValidator:
    """
    Validates uploaded files for size and type

    Usage:
        validate_avatar = FileValidator(
            max_size=settings.MAX_AVATAR_SIZE,
            allowed_extensions=settings.ALLOWED_IMAGE_EXTENSIONS
        )
    """

    def __init__(self, max_size=None, allowed_extensions=None, allowed_mimetypes=None):
        self.max_size = max_size
        self.allowed_extensions = allowed_extensions or []
        self.allowed_mimetypes = allowed_mimetypes or []

    def __call__(self, file):
        # Validate file size
        if self.max_size and file.size > self.max_size:
            max_size_mb = self.max_size / (1024 * 1024)
            raise ValidationError(
                f"File size must be under {max_size_mb:.1f}MB. Current size: {file.size / (1024 * 1024):.1f}MB"
            )

        # Validate file extension
        if self.allowed_extensions:
            ext = os.path.splitext(file.name)[1].lower()
            if ext not in self.allowed_extensions:
                raise ValidationError(
                    f'File type "{ext}" is not allowed. Allowed types: {", ".join(self.allowed_extensions)}'
                )

        # Validate MIME type
        if self.allowed_mimetypes:
            mime_type = mimetypes.guess_type(file.name)[0]
            if mime_type not in self.allowed_mimetypes:
                raise ValidationError(f'File MIME type "{mime_type}" is not allowed.')

        # Basic malicious file detection
        self._check_malicious_content(file)

    def _check_malicious_content(self, file):
        """Basic check for malicious content"""
        # Read first 1KB to check for suspicious patterns
        try:
            file.seek(0)
            header = file.read(1024)
            file.seek(0)

            # Check for executable signatures
            dangerous_signatures = [
                b"MZ",  # Windows executable
                b"\x7fELF",  # Linux executable
                b"#!/",  # Shell script
                b"<?php",  # PHP script
            ]

            for signature in dangerous_signatures:
                if header.startswith(signature):
                    raise ValidationError(
                        "File appears to contain executable code and cannot be uploaded."
                    )
        except Exception as e:
            # If we can't read the file, reject it
            if isinstance(e, ValidationError):
                raise
            raise ValidationError("Unable to validate file content.") from None


_ACTIVE_CONTENT_PREFIXES = (
    b"<html",
    b"<!doctype",
    b"<script",
    b"<?php",
    b"<svg",
    b"<?xml",
    b"javascript:",
    b"mz",
)


def _header_is_active_content(header: bytes) -> bool:
    sample = header.lstrip()[:64].lower()
    return sample.startswith(_ACTIVE_CONTENT_PREFIXES)


def _sniffed_mime(header: bytes) -> str:
    try:
        import magic

        return magic.from_buffer(header, mime=True) or ""
    except Exception:
        return ""


_ALLOWED_RESOURCE_MIMES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",  # docx/office files are zip containers
    "text/plain",
    "audio/mpeg",
    "audio/wav",
    "audio/x-wav",
    "audio/mp4",
    "audio/x-m4a",
    "audio/ogg",
    "audio/vorbis",
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
}


def validate_resource_upload(uploaded):
    """Reject resource uploads that are not an allowlisted type or look active."""
    if uploaded is None:
        return
    name = getattr(uploaded, "name", "") or ""
    ext = os.path.splitext(name)[1].lower()
    allowed = (
        list(getattr(settings, "ALLOWED_DOCUMENT_EXTENSIONS", []))
        + list(getattr(settings, "ALLOWED_AUDIO_EXTENSIONS", []))
        + list(getattr(settings, "ALLOWED_VIDEO_EXTENSIONS", []))
        + list(getattr(settings, "ALLOWED_IMAGE_EXTENSIONS", []))
    )
    if ext not in allowed:
        raise ValidationError(
            f'File type "{ext or "unknown"}" is not allowed. Allowed types: {", ".join(allowed)}'
        )

    size_limit = getattr(settings, "MAX_MEDIA_SIZE", 50 * 1024 * 1024)
    if ext in getattr(settings, "ALLOWED_DOCUMENT_EXTENSIONS", []):
        size_limit = getattr(settings, "MAX_DOCUMENT_SIZE", size_limit)
    elif ext in getattr(settings, "ALLOWED_IMAGE_EXTENSIONS", []):
        size_limit = getattr(settings, "MAX_AVATAR_SIZE", size_limit)
    if uploaded.size and uploaded.size > size_limit:
        raise ValidationError("File is too large.")

    try:
        uploaded.seek(0)
        header = uploaded.read(2048)
        uploaded.seek(0)
    except Exception as exc:
        raise ValidationError("Unable to read the uploaded file.") from exc

    if _header_is_active_content(header):
        raise ValidationError("That file content is not allowed.")

    mime = _sniffed_mime(header)
    if mime in {
        "text/html",
        "image/svg+xml",
        "application/javascript",
        "text/javascript",
        "application/x-httpd-php",
        "application/x-executable",
        "application/x-dosexec",
    }:
        raise ValidationError("That file content is not allowed.")
    if (
        mime
        and mime != "application/octet-stream"
        and mime not in _ALLOWED_RESOURCE_MIMES
        and not mime.startswith(("audio/", "video/", "image/"))
    ):
        raise ValidationError("That file content is not allowed.")


def image_content_type(path) -> str | None:
    """Return an image mime when the file sniffs as an image, else None."""
    try:
        with open(path, "rb") as handle:
            header = handle.read(64)
    except OSError:
        return None
    if header.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if header.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if header.startswith((b"GIF87a", b"GIF89a")):
        return "image/gif"
    if header.startswith(b"RIFF") and b"WEBP" in header[:16]:
        return "image/webp"
    return None


def sanitize_filename(filename):
    """
    Sanitize filename to prevent directory traversal and other attacks

    Args:
        filename: Original filename

    Returns:
        Sanitized filename safe for storage
    """
    # Get the base name (removes any path components)
    filename = os.path.basename(filename)

    # Replace spaces and special characters
    filename = filename.replace(" ", "_")

    # Remove any characters that aren't alphanumeric, dash, underscore, or dot
    import re

    filename = re.sub(r"[^a-zA-Z0-9._-]", "", filename)

    # Ensure filename isn't empty
    if not filename or filename == ".":
        filename = "unnamed_file"

    return filename


# Pre-configured validators for common use cases
validate_avatar = FileValidator(
    max_size=getattr(settings, "MAX_AVATAR_SIZE", 5 * 1024 * 1024),
    allowed_extensions=getattr(
        settings, "ALLOWED_IMAGE_EXTENSIONS", [".jpg", ".jpeg", ".png", ".gif", ".webp"]
    ),
)

validate_image = FileValidator(
    max_size=getattr(settings, "MAX_AVATAR_SIZE", 5 * 1024 * 1024),
    allowed_extensions=getattr(
        settings, "ALLOWED_IMAGE_EXTENSIONS", [".jpg", ".jpeg", ".png", ".gif", ".webp"]
    ),
)

validate_document = FileValidator(
    max_size=getattr(settings, "MAX_DOCUMENT_SIZE", 10 * 1024 * 1024),
    allowed_extensions=getattr(
        settings, "ALLOWED_DOCUMENT_EXTENSIONS", [".pdf", ".doc", ".docx", ".txt"]
    ),
)

validate_media = FileValidator(
    max_size=getattr(settings, "MAX_MEDIA_SIZE", 50 * 1024 * 1024),
    allowed_extensions=(
        getattr(settings, "ALLOWED_AUDIO_EXTENSIONS", [])
        + getattr(settings, "ALLOWED_VIDEO_EXTENSIONS", [])
    ),
)
