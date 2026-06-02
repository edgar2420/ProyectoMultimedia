import io
import os
import uuid
from PIL import Image, ImageOps
from django.conf import settings

THUMBNAIL_SIZE = (400, 400)   # máx 400×400 manteniendo proporción
THUMBNAIL_QUALITY = 85
THUMBNAIL_FORMAT = "JPEG"
THUMBNAIL_SUBDIR = "thumbnails"

SUPPORTED_MIME_TYPES = {
    "image/jpeg", "image/png", "image/gif",
    "image/webp", "image/bmp", "image/tiff",
}


def generate_thumbnail(file_bytes: bytes, original_name: str,
                        mime_type: str) -> tuple[str, str] | None:
    """
    Genera un thumbnail y lo guarda en MEDIA_ROOT/thumbnails/.
    Devuelve (storage_path, public_url) o None si no aplica.
    """
    if mime_type not in SUPPORTED_MIME_TYPES:
        return None

    try:
        img = Image.open(io.BytesIO(file_bytes))

        # Corregir orientación EXIF antes de hacer thumbnail
        img = ImageOps.exif_transpose(img)

        # Convertir a RGB si es necesario (para guardar como JPEG)
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")

        img.thumbnail(THUMBNAIL_SIZE, Image.LANCZOS)

        # Guardar
        unique_name = f"{uuid.uuid4().hex}.jpg"
        relative_path = f"uploads/{THUMBNAIL_SUBDIR}/{unique_name}"
        abs_path = os.path.join(str(settings.MEDIA_ROOT), relative_path)
        os.makedirs(os.path.dirname(abs_path), exist_ok=True)

        img.save(abs_path, format=THUMBNAIL_FORMAT, quality=THUMBNAIL_QUALITY, optimize=True)

        public_url = f"{settings.MEDIA_URL.rstrip('/')}/{relative_path}"
        return relative_path, public_url

    except Exception:
        return None
