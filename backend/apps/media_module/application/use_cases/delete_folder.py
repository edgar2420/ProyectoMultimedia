from apps.media_module.application.ports.folder_port import FolderPort


class DeleteFolderUseCase:
    def __init__(self, port: FolderPort):
        self._port = port

    def execute(self, folder_id: int, owner_id: int) -> None:
        self._port.delete(folder_id, owner_id)
