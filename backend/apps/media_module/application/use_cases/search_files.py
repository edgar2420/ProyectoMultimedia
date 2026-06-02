from apps.media_module.application.ports.media_file_port import MediaFilePort
from apps.media_module.domain.media_file import MediaFile


class SearchFilesUseCase:
    def __init__(self, repo: MediaFilePort):
        self._repo = repo

    def execute(self, owner_id: int, params: dict) -> tuple[list[MediaFile], int]:
        return self._repo.search(owner_id, params)
