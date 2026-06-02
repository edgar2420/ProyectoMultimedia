"""Genera thumbnail (portada) de video usando ffmpeg."""
import os
import shutil
import subprocess
import tempfile
import uuid
from django.conf import settings

VIDEO_MIME_TYPES = {
    "video/mp4", "video/avi", "video/quicktime",
    "video/webm", "video/x-msvideo", "video/mpeg",
    "video/x-matroska", "video/3gpp",
}

THUMBNAIL_WIDTH = 640   # ancho máximo del poster


def _find_ffmpeg() -> str | None:
    path = shutil.which("ffmpeg")
    if path:
        return path
    import glob
    candidates = [
        r"C:\ffmpeg\bin\ffmpeg.exe",
        r"C:\Program Files\ffmpeg\bin\ffmpeg.exe",
        r"C:\ProgramData\chocolatey\bin\ffmpeg.exe",
    ]
    appdata = os.environ.get("LOCALAPPDATA", "")
    if appdata:
        pattern = os.path.join(appdata, "Microsoft", "WinGet", "Packages",
                               "Gyan.FFmpeg*", "**", "ffmpeg.exe")
        found = glob.glob(pattern, recursive=True)
        candidates.extend(found)
    for c in candidates:
        if os.path.exists(c):
            return c
    return None


def generate_video_thumbnail(
    file_bytes: bytes,
    mime_type: str,
    duration_seconds: float = 0.0,
) -> tuple[str, str] | None:
    """
    Extrae un frame del video y lo guarda como JPEG.
    Devuelve (storage_path, public_url) o None si falla.
    El frame se toma al 10% de la duración (mínimo 2 segundos).
    """
    if mime_type not in VIDEO_MIME_TYPES:
        return None

    ffmpeg = _find_ffmpeg()
    if not ffmpeg:
        return None

    ext_map = {
        "video/mp4": ".mp4", "video/avi": ".avi",
        "video/quicktime": ".mov", "video/webm": ".webm",
        "video/x-msvideo": ".avi", "video/mpeg": ".mpeg",
        "video/x-matroska": ".mkv", "video/3gpp": ".3gp",
    }
    ext = ext_map.get(mime_type, ".mp4")

    # Calcular timestamp: 10% de la duración, mínimo 2s, máximo 30s
    if duration_seconds > 0:
        ts = min(max(duration_seconds * 0.1, 2.0), 30.0)
    else:
        ts = 2.0

    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp_in:
        tmp_in.write(file_bytes)
        tmp_in_path = tmp_in.name

    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp_out:
        tmp_out_path = tmp_out.name

    try:
        result = subprocess.run(
            [
                ffmpeg,
                "-ss", str(ts),
                "-i", tmp_in_path,
                "-vframes", "1",
                "-vf", f"scale={THUMBNAIL_WIDTH}:-2",
                "-q:v", "3",
                "-y",           # sobreescribir si existe
                tmp_out_path,
            ],
            capture_output=True, timeout=60,
        )

        if result.returncode != 0 or not os.path.exists(tmp_out_path):
            return None

        # Guardar en MEDIA_ROOT
        unique_name = f"{uuid.uuid4().hex}.jpg"
        relative_path = f"uploads/thumbnails/{unique_name}"
        abs_path = os.path.join(str(settings.MEDIA_ROOT), relative_path)
        os.makedirs(os.path.dirname(abs_path), exist_ok=True)

        with open(tmp_out_path, "rb") as f:
            thumb_bytes = f.read()

        if not thumb_bytes:
            return None

        with open(abs_path, "wb") as f:
            f.write(thumb_bytes)

        public_url = f"{settings.MEDIA_URL.rstrip('/')}/{relative_path}"
        return relative_path, public_url

    except (subprocess.TimeoutExpired, Exception):
        return None
    finally:
        os.unlink(tmp_in_path)
        if os.path.exists(tmp_out_path):
            os.unlink(tmp_out_path)
