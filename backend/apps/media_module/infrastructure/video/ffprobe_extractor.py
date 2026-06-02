"""Extrae metadata de video usando ffprobe (parte de ffmpeg)."""
import json
import os
import shutil
import subprocess
import tempfile
from apps.media_module.domain.video_metadata import VideoMetadata

VIDEO_MIME_TYPES = {
    "video/mp4", "video/avi", "video/quicktime",
    "video/webm", "video/x-msvideo", "video/mpeg",
    "video/x-matroska", "video/3gpp",
}


def _find_ffprobe() -> str | None:
    path = shutil.which("ffprobe")
    if path:
        return path
    # Buscar en directorios de usuario y sistema (WinGet, chocolatey, scoop, manual)
    import glob
    candidates = [
        r"C:\ffmpeg\bin\ffprobe.exe",
        r"C:\Program Files\ffmpeg\bin\ffprobe.exe",
        r"C:\ProgramData\chocolatey\bin\ffprobe.exe",
    ]
    # WinGet instala en AppData del usuario
    import os as _os
    appdata = _os.environ.get("LOCALAPPDATA", "")
    if appdata:
        pattern = _os.path.join(appdata, "Microsoft", "WinGet", "Packages",
                                "Gyan.FFmpeg*", "**", "ffprobe.exe")
        found = glob.glob(pattern, recursive=True)
        candidates.extend(found)
    for c in candidates:
        if _os.path.exists(c):
            return c
    return None


def _eval_fraction(frac: str) -> float:
    """Evalúa fracciones como '30000/1001' → 29.97"""
    try:
        if "/" in frac:
            num, den = frac.split("/")
            return float(num) / float(den) if float(den) != 0 else 0.0
        return float(frac)
    except Exception:
        return 0.0


def extract_video_metadata(file_path: str, mime_type: str) -> VideoMetadata | None:
    if mime_type not in VIDEO_MIME_TYPES:
        return None

    ffprobe = _find_ffprobe()
    if not ffprobe:
        return None

    try:
        result = subprocess.run(
            [
                ffprobe, "-v", "quiet",
                "-print_format", "json",
                "-show_streams", "-show_format",
                file_path,
            ],
            capture_output=True, text=True, timeout=30,
        )
        if result.returncode != 0:
            return None

        data = json.loads(result.stdout)
        fmt = data.get("format", {})
        streams = data.get("streams", [])

        video_stream = next((s for s in streams if s.get("codec_type") == "video"), None)
        audio_stream = next((s for s in streams if s.get("codec_type") == "audio"), None)

        if not video_stream:
            return None

        # FPS — preferir avg_frame_rate
        fps_raw = video_stream.get("avg_frame_rate") or video_stream.get("r_frame_rate", "0/1")
        fps = _eval_fraction(fps_raw)

        # Duración (formato tiene prioridad sobre stream)
        duration = float(
            fmt.get("duration") or video_stream.get("duration") or 0
        )

        # Bitrate en kbps
        bitrate_raw = fmt.get("bit_rate") or video_stream.get("bit_rate") or "0"
        bitrate_kbps = int(int(bitrate_raw) / 1000)

        return VideoMetadata(
            width=int(video_stream.get("width", 0)),
            height=int(video_stream.get("height", 0)),
            duration_seconds=duration,
            format_name=fmt.get("format_name", "").split(",")[0],
            format_long_name=fmt.get("format_long_name", ""),
            video_codec=video_stream.get("codec_name", "unknown"),
            fps=round(fps, 3),
            bitrate_kbps=bitrate_kbps,
            audio_codec=audio_stream.get("codec_name") if audio_stream else None,
            audio_channels=int(audio_stream["channels"]) if audio_stream else None,
            audio_sample_rate=int(audio_stream.get("sample_rate", 0)) if audio_stream else None,
            has_audio=audio_stream is not None,
            file_size=int(fmt.get("size", 0)),
        )

    except (subprocess.TimeoutExpired, json.JSONDecodeError, Exception):
        return None


def extract_video_metadata_from_bytes(file_bytes: bytes, mime_type: str) -> VideoMetadata | None:
    """Wrapper que escribe a un archivo temporal y llama al extractor."""
    if mime_type not in VIDEO_MIME_TYPES:
        return None
    # Determinar extensión desde mime_type
    ext_map = {
        "video/mp4": ".mp4", "video/avi": ".avi",
        "video/quicktime": ".mov", "video/webm": ".webm",
        "video/x-msvideo": ".avi", "video/mpeg": ".mpeg",
        "video/x-matroska": ".mkv", "video/3gpp": ".3gp",
    }
    ext = ext_map.get(mime_type, ".mp4")
    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name
    try:
        return extract_video_metadata(tmp_path, mime_type)
    finally:
        os.unlink(tmp_path)
