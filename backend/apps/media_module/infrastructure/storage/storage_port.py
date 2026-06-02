from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import BinaryIO


@dataclass
class StoredFile:
    storage_path: str   # ruta relativa en el storage (ej: uploads/image/abc.png)
    public_url: str     # URL para el cliente (ej: /media/uploads/image/abc.png)
    size: int


class StoragePort(ABC):
    """Contrato que desacopla el dominio del sistema de almacenamiento físico.
    Implementaciones posibles: local filesystem, S3, GCS, Azure Blob, etc.
    """

    @abstractmethod
    def save(self, file: BinaryIO, filename: str, subfolder: str) -> StoredFile:
        """Guarda el archivo y devuelve su ubicación."""
        pass

    @abstractmethod
    def delete(self, storage_path: str) -> None:
        """Elimina el archivo del storage."""
        pass

    @abstractmethod
    def exists(self, storage_path: str) -> bool:
        pass
