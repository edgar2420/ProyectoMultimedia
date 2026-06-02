from typing import BinaryIO
from apps.media_module.application.ports.media_file_port import MediaFilePort
from apps.media_module.domain.media_file import MediaFile

MAX_SIZE_BYTES = 100 * 1024 * 1024  # 100 MB

ALLOWED_MIMES = {
    # Imágenes
    "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
    # Video
    "video/mp4", "video/avi", "video/quicktime", "video/webm", "video/x-msvideo",
    # Audio
    "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav",
    "audio/ogg", "audio/flac", "audio/x-flac",
    "audio/aac", "audio/mp4", "audio/m4a", "audio/x-m4a",
    "audio/opus", "audio/webm",
    # Documentos
    "application/pdf", "application/x-pdf",
}


class UploadFileUseCase:
    def __init__(self, port: MediaFilePort):
        self._port = port

    def execute(self, file: BinaryIO, original_name: str, mime_type: str,
                size: int, owner_id: int, folder_id: int | None = None) -> MediaFile:
        if size > MAX_SIZE_BYTES:
            raise ValueError("El archivo supera el límite de 100 MB.")
        if mime_type not in ALLOWED_MIMES:
            raise ValueError(f"Tipo de archivo no permitido: {mime_type}")
        return self._port.save(file, original_name, mime_type, size, owner_id, folder_id)
