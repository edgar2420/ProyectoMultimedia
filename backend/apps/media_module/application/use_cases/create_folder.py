from apps.media_module.application.ports.folder_port import FolderPort
from apps.media_module.domain.folder import Folder


class CreateFolderUseCase:
    def __init__(self, port: FolderPort):
        self._port = port

    def execute(self, name: str, owner_id: int,
                parent_id: int | None = None) -> Folder:
        name = name.strip()
        if not name:
            raise ValueError("El nombre de la carpeta no puede estar vacío.")
        if len(name) > 100:
            raise ValueError("El nombre no puede superar 100 caracteres.")
        if self._port.name_exists_in_parent(name, owner_id, parent_id):
            raise ValueError(f"Ya existe una carpeta llamada '{name}' en esta ubicación.")
        return self._port.create(name, owner_id, parent_id)
