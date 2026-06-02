from dataclasses import dataclass
from datetime import datetime
from enum import Enum


class FileType(str, Enum):
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    DOCUMENT = "document"
    OTHER = "other"


MIME_TYPE_MAP: dict[str, FileType] = {
    "image/jpeg": FileType.IMAGE,
    "image/png": FileType.IMAGE,
    "image/gif": FileType.IMAGE,
    "image/webp": FileType.IMAGE,
    "image/svg+xml": FileType.IMAGE,
    "video/mp4": FileType.VIDEO,
    "video/avi": FileType.VIDEO,
    "video/mov": FileType.VIDEO,
    "video/quicktime": FileType.VIDEO,
    "video/webm": FileType.VIDEO,
    "audio/mpeg": FileType.AUDIO,
    "audio/mp3": FileType.AUDIO,
    "audio/wav": FileType.AUDIO,
    "audio/x-wav": FileType.AUDIO,
    "audio/ogg": FileType.AUDIO,
    "audio/flac": FileType.AUDIO,
    "audio/x-flac": FileType.AUDIO,
    "audio/aac": FileType.AUDIO,
    "audio/mp4": FileType.AUDIO,
    "audio/m4a": FileType.AUDIO,
    "audio/x-m4a": FileType.AUDIO,
    "audio/opus": FileType.AUDIO,
    "audio/webm": FileType.AUDIO,
    "application/pdf": FileType.DOCUMENT,
}


def get_file_type(mime_type: str) -> FileType:
    return MIME_TYPE_MAP.get(mime_type, FileType.OTHER)


@dataclass
class MediaFile:
    id: int
    name: str
    original_name: str
    storage_path: str
    file_url: str
    file_type: str
    mime_type: str
    size: int
    owner_id: int
    folder_id: int | None
    thumbnail_url: str | None     # URL del thumbnail/poster generado
    image_metadata: dict | None   # EXIF + dimensiones (solo imágenes)
    video_metadata: dict | None   # duración, codec, fps… (solo videos)
    audio_metadata: dict | None   # duración, codec, tags ID3… (solo audio)
    pdf_metadata: dict | None     # páginas, autor, título… (solo PDF)
    tags: list[dict]              # etiquetas [{id, name, color}]
    created_at: datetime
    updated_at: datetime
