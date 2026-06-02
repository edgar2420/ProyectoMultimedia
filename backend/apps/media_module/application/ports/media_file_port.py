from abc import ABC, abstractmethod
from typing import BinaryIO
from apps.media_module.domain.media_file import MediaFile


class MediaFilePort(ABC):
    @abstractmethod
    def save(self, file: BinaryIO, original_name: str, mime_type: str,
             size: int, owner_id: int, folder_id: int | None) -> MediaFile:
        pass

    @abstractmethod
    def list_by_owner(self, owner_id: int, folder_id: int | None,
                      file_type: str | None, search: str | None,
                      ordering: str = "-created_at",
                      tag_ids: list[int] | None = None) -> list[MediaFile]:
        pass

    @abstractmethod
    def get_by_id(self, file_id: int, owner_id: int) -> MediaFile:
        pass

    @abstractmethod
    def move_to_folder(self, file_id: int, owner_id: int, folder_id: int | None) -> MediaFile:
        pass

    @abstractmethod
    def delete(self, file_id: int, owner_id: int) -> None:
        pass

    @abstractmethod
    def search(self, owner_id: int, params: dict) -> tuple[list[MediaFile], int]:
        """Búsqueda avanzada cross-folder. Devuelve (resultados, total)."""
        pass
