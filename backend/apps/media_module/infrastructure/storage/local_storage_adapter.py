import os
import uuid
from typing import BinaryIO
from django.conf import settings
from .storage_port import StoragePort, StoredFile


class LocalStorageAdapter(StoragePort):
    """Implementación concreta: almacena archivos en MEDIA_ROOT del servidor."""

    def __init__(self):
        self._root: str = str(settings.MEDIA_ROOT)
        self._url_base: str = settings.MEDIA_URL.rstrip("/")

    def save(self, file: BinaryIO, filename: str, subfolder: str) -> StoredFile:
        ext = os.path.splitext(filename)[1].lower()
        unique_name = f"{uuid.uuid4().hex}{ext}"
        relative_path = f"uploads/{subfolder}/{unique_name}"
        abs_path = os.path.join(self._root, relative_path)

        os.makedirs(os.path.dirname(abs_path), exist_ok=True)
        content = file.read()
        with open(abs_path, "wb") as f:
            f.write(content)

        return StoredFile(
            storage_path=relative_path,
            public_url=f"{self._url_base}/{relative_path}",
            size=len(content),
        )

    def delete(self, storage_path: str) -> None:
        abs_path = os.path.join(self._root, storage_path)
        if os.path.exists(abs_path):
            os.remove(abs_path)
            # limpiar directorio vacío
            parent = os.path.dirname(abs_path)
            if os.path.isdir(parent) and not os.listdir(parent):
                os.rmdir(parent)

    def exists(self, storage_path: str) -> bool:
        return os.path.exists(os.path.join(self._root, storage_path))
