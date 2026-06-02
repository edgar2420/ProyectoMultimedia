from apps.media_module.application.ports.folder_port import FolderPort
from apps.media_module.domain.folder import Folder


class RenameFolderUseCase:
    def __init__(self, port: FolderPort):
        self._port = port

    def execute(self, folder_id: int, owner_id: int, new_name: str) -> Folder:
        new_name = new_name.strip()
        if not new_name:
            raise ValueError("El nombre no puede estar vacío.")
        if len(new_name) > 100:
            raise ValueError("El nombre no puede superar 100 caracteres.")

        folder = self._port.get_by_id(folder_id, owner_id)
        if folder.name == new_name:
            return folder

        if self._port.name_exists_in_parent(new_name, owner_id, folder.parent_id):
            raise ValueError(f"Ya existe una carpeta llamada '{new_name}' en esta ubicación.")

        return self._port.rename(folder_id, owner_id, new_name)
