from apps.media_module.application.ports.folder_port import FolderPort
from apps.media_module.domain.folder import Folder


class ListFoldersUseCase:
    def __init__(self, port: FolderPort):
        self._port = port

    def execute(self, owner_id: int, parent_id: int | None = None) -> list[Folder]:
        return self._port.list_by_owner(owner_id, parent_id)
