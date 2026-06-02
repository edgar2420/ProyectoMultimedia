"""
Extrae metadata de PDF y genera thumbnail de la primera página
usando PyMuPDF (fitz) — sin dependencias de poppler o ghostscript.
"""
import io
import os
import uuid

from django.conf import settings

from apps.media_module.domain.pdf_metadata import PdfMetadata

PDF_MIME_TYPES = {"application/pdf", "application/x-pdf"}

THUMBNAIL_DPI = 150          # resolución de renderizado
THUMBNAIL_QUALITY = 85       # calidad JPEG del thumbnail
THUMBNAIL_MAX_WIDTH = 600    # ancho máximo del thumbnail


def _clean_tag(value: str | None) -> str | None:
    """Limpia strings de metadata PDF (quita D: prefijos de fechas, strips)."""
    if not value:
        return None
    v = str(value).strip()
    return v if v else None


def _parse_pdf_date(raw: str | None) -> str | None:
    """Convierte 'D:20240115120000+00'00'' → '2024-01-15 12:00:00'."""
    if not raw:
        return None
    raw = raw.strip()
    if raw.startswith("D:"):
        raw = raw[2:]
    # Tomamos los primeros 14 dígitos (YYYYMMDDHHmmss)
    digits = "".join(c for c in raw[:14] if c.isdigit())
    if len(digits) >= 8:
        y, m, d = digits[:4], digits[4:6], digits[6:8]
        hh, mm = digits[8:10] or "00", digits[10:12] or "00"
        return f"{y}-{m}-{d} {hh}:{mm}"
    return raw


def extract_pdf_metadata(
    file_bytes: bytes, mime_type: str
) -> PdfMetadata | None:
    """Extrae metadata del PDF. Devuelve None si no es PDF o falla."""
    if mime_type not in PDF_MIME_TYPES:
        return None
    try:
        import fitz  # PyMuPDF

        doc = fitz.open(stream=file_bytes, filetype="pdf")
        meta = doc.metadata or {}

        # Dimensiones de la primera página
        page_w = page_h = None
        if doc.page_count > 0:
            page = doc[0]
            rect = page.rect
            page_w = round(rect.width, 2)
            page_h = round(rect.height, 2)

        result = PdfMetadata(
            page_count=doc.page_count,
            file_size=len(file_bytes),
            title=_clean_tag(meta.get("title")),
            author=_clean_tag(meta.get("author")),
            subject=_clean_tag(meta.get("subject")),
            creator=_clean_tag(meta.get("creator")),
            producer=_clean_tag(meta.get("producer")),
            creation_date=_parse_pdf_date(meta.get("creationDate")),
            modification_date=_parse_pdf_date(meta.get("modDate")),
            encrypted=doc.is_encrypted,
            page_width_pt=page_w,
            page_height_pt=page_h,
        )
        doc.close()
        return result

    except Exception:
        return None


def generate_pdf_thumbnail(
    file_bytes: bytes, mime_type: str
) -> tuple[str, str] | None:
    """
    Renderiza la primera página del PDF como JPEG.
    Devuelve (storage_path, public_url) o None si falla.
    """
    if mime_type not in PDF_MIME_TYPES:
        return None
    try:
        import fitz

        doc = fitz.open(stream=file_bytes, filetype="pdf")
        if doc.page_count == 0:
            doc.close()
            return None

        page = doc[0]
        # Calcular zoom para alcanzar THUMBNAIL_DPI (PDF interno = 72 dpi)
        zoom = THUMBNAIL_DPI / 72
        mat = fitz.Matrix(zoom, zoom)
        pixmap = page.get_pixmap(matrix=mat, alpha=False)
        doc.close()

        # Convertir pixmap a PIL para resize y compresión JPEG
        from PIL import Image
        img = Image.frombytes("RGB", [pixmap.width, pixmap.height], pixmap.samples)

        if img.width > THUMBNAIL_MAX_WIDTH:
            ratio = THUMBNAIL_MAX_WIDTH / img.width
            img = img.resize(
                (THUMBNAIL_MAX_WIDTH, int(img.height * ratio)),
                Image.LANCZOS,
            )

        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=THUMBNAIL_QUALITY, optimize=True)
        thumb_bytes = buf.getvalue()

        # Guardar en MEDIA_ROOT
        unique_name = f"{uuid.uuid4().hex}.jpg"
        relative_path = f"uploads/thumbnails/{unique_name}"
        abs_path = os.path.join(str(settings.MEDIA_ROOT), relative_path)
        os.makedirs(os.path.dirname(abs_path), exist_ok=True)

        with open(abs_path, "wb") as f:
            f.write(thumb_bytes)

        public_url = f"{settings.MEDIA_URL.rstrip('/')}/{relative_path}"
        return relative_path, public_url

    except Exception:
        return None
