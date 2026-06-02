from abc import ABC, abstractmethod
from apps.media_module.domain.folder import Folder


class FolderPort(ABC):
    @abstractmethod
    def create(self, name: str, owner_id: int, parent_id: int | None) -> Folder:
        pass

    @abstractmethod
    def list_by_owner(self, owner_id: int, parent_id: int | None) -> list[Folder]:
        pass

    @abstractmethod
    def get_by_id(self, folder_id: int, owner_id: int) -> Folder:
        pass

    @abstractmethod
    def get_ancestors(self, folder_id: int, owner_id: int) -> list[Folder]:
        """Devuelve la cadena de carpetas desde raíz hasta folder_id (para breadcrumb)."""
        pass

    @abstractmethod
    def delete(self, folder_id: int, owner_id: int) -> None:
        pass

    @abstractmethod
    def rename(self, folder_id: int, owner_id: int, new_name: str) -> Folder:
        pass

    @abstractmethod
    def get_all_by_owner(self, owner_id: int) -> list[Folder]:
        """Devuelve TODAS las carpetas del usuario (para construir el árbol completo)."""
        pass

    @abstractmethod
    def name_exists_in_parent(self, name: str, owner_id: int, parent_id: int | None) -> bool:
        pass
