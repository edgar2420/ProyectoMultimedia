from apps.media_module.application.ports.media_file_port import MediaFilePort


class DeleteFileUseCase:
    def __init__(self, port: MediaFilePort):
        self._port = port

    def execute(self, file_id: int, owner_id: int) -> None:
        self._port.delete(file_id, owner_id)
