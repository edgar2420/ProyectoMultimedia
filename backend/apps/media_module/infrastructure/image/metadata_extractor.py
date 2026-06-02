import io
from PIL import Image, ExifTags
from apps.media_module.domain.image_metadata import ImageMetadata

# Mapeo de IDs EXIF a nombres legibles
_EXIF_TAGS = {v: k for k, v in ExifTags.TAGS.items()}

THUMBNAIL_MIME_TYPES = {
    "image/jpeg", "image/png", "image/gif",
    "image/webp", "image/bmp", "image/tiff",
}


def _safe_rational(val) -> str | None:
    """Convierte IFDRational o tupla (num, den) a string legible."""
    try:
        if hasattr(val, "numerator") and hasattr(val, "denominator"):
            num, den = int(val.numerator), int(val.denominator)
        elif isinstance(val, tuple) and len(val) == 2:
            num, den = int(val[0]), int(val[1])
        else:
            return str(val)
        if den == 0:
            return None
        if den == 1:
            return str(num)
        return f"{num}/{den}"
    except Exception:
        return None


def _gps_to_decimal(coord, ref: str) -> float | None:
    """Convierte coordenadas GPS DMS a decimal."""
    try:
        d = float(coord[0].numerator) / float(coord[0].denominator)
        m = float(coord[1].numerator) / float(coord[1].denominator)
        s = float(coord[2].numerator) / float(coord[2].denominator)
        decimal = d + m / 60 + s / 3600
        if ref in ("S", "W"):
            decimal = -decimal
        return round(decimal, 6)
    except Exception:
        return None


def extract_metadata(file_bytes: bytes, mime_type: str) -> ImageMetadata | None:
    """Extrae metadata e info EXIF de una imagen. Devuelve None si no es imagen soportada."""
    if mime_type not in THUMBNAIL_MIME_TYPES:
        return None

    try:
        img = Image.open(io.BytesIO(file_bytes))
        width, height = img.size
        fmt = img.format or "UNKNOWN"
        mode = img.mode

        exif_data: dict = {}
        has_exif = False

        # Intentar extraer EXIF
        try:
            raw_exif = img._getexif()
            if raw_exif:
                has_exif = True
                exif_data = {
                    ExifTags.TAGS.get(k, k): v
                    for k, v in raw_exif.items()
                }
        except (AttributeError, Exception):
            pass

        # GPS
        gps_lat = gps_lon = None
        gps_info = exif_data.get("GPSInfo")
        if gps_info and isinstance(gps_info, dict):
            try:
                lat = _gps_to_decimal(gps_info.get(2), gps_info.get(1, "N"))
                lon = _gps_to_decimal(gps_info.get(4), gps_info.get(3, "E"))
                gps_lat, gps_lon = lat, lon
            except Exception:
                pass

        # Flash
        flash_val = exif_data.get("Flash")
        flash_str = None
        if flash_val is not None:
            flash_str = "Disparó" if (int(flash_val) & 0x1) else "No disparó"

        # ISO
        iso_raw = exif_data.get("ISOSpeedRatings") or exif_data.get("PhotographicSensitivity")
        iso = int(iso_raw) if iso_raw else None

        return ImageMetadata(
            width=width,
            height=height,
            format=fmt,
            color_mode=mode,
            camera_make=str(exif_data["Make"]).strip() if "Make" in exif_data else None,
            camera_model=str(exif_data["Model"]).strip() if "Model" in exif_data else None,
            date_taken=str(exif_data.get("DateTimeOriginal") or exif_data.get("DateTime") or ""),
            exposure_time=_safe_rational(exif_data["ExposureTime"]) if "ExposureTime" in exif_data else None,
            f_number=_safe_rational(exif_data["FNumber"]) if "FNumber" in exif_data else None,
            iso_speed=iso,
            focal_length=_safe_rational(exif_data["FocalLength"]) if "FocalLength" in exif_data else None,
            flash=flash_str,
            gps_latitude=gps_lat,
            gps_longitude=gps_lon,
            software=str(exif_data["Software"]).strip() if "Software" in exif_data else None,
            orientation=int(exif_data["Orientation"]) if "Orientation" in exif_data else None,
            has_exif=has_exif,
        )
    except Exception:
        return None
