from apps.media_module.application.ports.media_file_port import MediaFilePort
from apps.media_module.domain.media_file import MediaFile


class ListFilesUseCase:
    def __init__(self, port: MediaFilePort):
        self._port = port

    def execute(self, owner_id: int, file_type: str | None = None,
                search: str | None = None) -> list[MediaFile]:
        return self._port.list_by_owner(owner_id, file_type, search)
