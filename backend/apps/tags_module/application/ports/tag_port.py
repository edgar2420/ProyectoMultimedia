from abc import ABC, abstractmethod
from apps.tags_module.domain.tag import Tag


class TagPort(ABC):
    @abstractmethod
    def create(self, name: str, color: str, owner_id: int) -> Tag:
        pass

    @abstractmethod
    def list_by_owner(self, owner_id: int) -> list[Tag]:
        pass

    @abstractmethod
    def get_by_id(self, tag_id: int, owner_id: int) -> Tag:
        pass

    @abstractmethod
    def delete(self, tag_id: int, owner_id: int) -> None:
        pass

    @abstractmethod
    def name_exists(self, name: str, owner_id: int) -> bool:
        pass

    @abstractmethod
    def add_tag_to_file(self, tag_id: int, file_id: int, owner_id: int) -> None:
        pass

    @abstractmethod
    def remove_tag_from_file(self, tag_id: int, file_id: int, owner_id: int) -> None:
        pass

    @abstractmethod
    def get_file_tags(self, file_id: int, owner_id: int) -> list[Tag]:
        pass

    @abstractmethod
    def set_file_tags(self, file_id: int, owner_id: int, tag_ids: list[int]) -> list[Tag]:
        """Reemplaza TODAS las etiquetas de un archivo de una vez."""
        pass

    @abstractmethod
    def get_files_by_tag(self, tag_id: int, owner_id: int) -> list[int]:
        """Devuelve IDs de archivos que tienen esta etiqueta."""
        pass

    @abstractmethod
    def update(self, tag_id: int, owner_id: int,
               name: str | None, color: str | None) -> Tag:
        """Actualiza nombre y/o color de una etiqueta."""
        pass

    @abstractmethod
    def bulk_add_tags(self, file_ids: list[int], owner_id: int,
                      tag_ids: list[int]) -> None:
        """Agrega etiquetas a múltiples archivos sin quitar las existentes."""
        pass
