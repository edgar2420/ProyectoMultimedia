"""Extrae metadata de audio usando ffprobe — técnica + tags ID3/Vorbis/APEv2."""
import glob
import json
import os
import shutil
import subprocess
import tempfile

from apps.media_module.domain.audio_metadata import AudioMetadata

AUDIO_MIME_TYPES = {
    "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav",
    "audio/ogg", "audio/flac", "audio/x-flac", "audio/aac",
    "audio/mp4", "audio/m4a", "audio/opus", "audio/webm",
    "audio/x-m4a",
}

AUDIO_EXT_MAP = {
    "audio/mpeg": ".mp3", "audio/mp3": ".mp3",
    "audio/wav": ".wav", "audio/x-wav": ".wav",
    "audio/ogg": ".ogg", "audio/flac": ".flac",
    "audio/x-flac": ".flac", "audio/aac": ".aac",
    "audio/mp4": ".m4a", "audio/m4a": ".m4a",
    "audio/x-m4a": ".m4a", "audio/opus": ".opus",
    "audio/webm": ".webm",
}


def _find_ffprobe() -> str | None:
    path = shutil.which("ffprobe")
    if path:
        return path
    appdata = os.environ.get("LOCALAPPDATA", "")
    candidates: list[str] = [
        r"C:\ffmpeg\bin\ffprobe.exe",
        r"C:\Program Files\ffmpeg\bin\ffprobe.exe",
        r"C:\ProgramData\chocolatey\bin\ffprobe.exe",
    ]
    if appdata:
        pattern = os.path.join(appdata, "Microsoft", "WinGet",
                               "Packages", "Gyan.FFmpeg*", "**", "ffprobe.exe")
        candidates.extend(glob.glob(pattern, recursive=True))
    return next((c for c in candidates if os.path.exists(c)), None)


def _tag(tags: dict, *keys: str) -> str | None:
    """Busca varias claves (case-insensitive) en el dict de tags."""
    lower = {k.lower(): v for k, v in tags.items()}
    for key in keys:
        val = lower.get(key.lower())
        if val:
            return str(val).strip()
    return None


def extract_audio_metadata_from_bytes(
    file_bytes: bytes, mime_type: str
) -> AudioMetadata | None:
    if mime_type not in AUDIO_MIME_TYPES:
        return None

    ffprobe = _find_ffprobe()
    if not ffprobe:
        return None

    ext = AUDIO_EXT_MAP.get(mime_type, ".mp3")
    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        result = subprocess.run(
            [
                ffprobe, "-v", "quiet",
                "-print_format", "json",
                "-show_streams", "-show_format",
                tmp_path,
            ],
            capture_output=True, text=True, timeout=30,
        )
        if result.returncode != 0:
            return None

        data = json.loads(result.stdout)
        fmt = data.get("format", {})
        streams = data.get("streams", [])

        audio_stream = next(
            (s for s in streams if s.get("codec_type") == "audio"), None
        )
        if not audio_stream:
            return None

        # Duración
        duration = float(
            fmt.get("duration") or audio_stream.get("duration") or 0
        )

        # Bitrate en kbps
        br_raw = fmt.get("bit_rate") or audio_stream.get("bit_rate") or "0"
        bitrate_kbps = max(int(int(br_raw) / 1000), 0)

        # Tags — buscar en formato y en el stream
        tags: dict = {}
        tags.update(fmt.get("tags") or {})
        tags.update(audio_stream.get("tags") or {})

        return AudioMetadata(
            duration_seconds=duration,
            codec=audio_stream.get("codec_name", "unknown"),
            bitrate_kbps=bitrate_kbps,
            sample_rate=int(audio_stream.get("sample_rate", 0) or 0),
            channels=int(audio_stream.get("channels", 0) or 0),
            format_name=fmt.get("format_name", "").split(",")[0],
            file_size=int(fmt.get("size", 0) or 0),
            title=_tag(tags, "title", "TIT2"),
            artist=_tag(tags, "artist", "TPE1", "performer"),
            album=_tag(tags, "album", "TALB"),
            album_artist=_tag(tags, "album_artist", "TPE2", "albumartist"),
            year=_tag(tags, "date", "year", "TDRC", "TYER"),
            genre=_tag(tags, "genre", "TCON"),
            track_number=_tag(tags, "track", "TRCK"),
            comment=_tag(tags, "comment", "COMM"),
            composer=_tag(tags, "composer", "TCOM"),
        )

    except (subprocess.TimeoutExpired, json.JSONDecodeError, Exception):
        return None
    finally:
        os.unlink(tmp_path)
