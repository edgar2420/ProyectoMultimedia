from apps.tags_module.application.ports.tag_port import TagPort
from apps.tags_module.domain.tag import Tag


class SetFileTagsUseCase:
    def __init__(self, port: TagPort):
        self._port = port

    def execute(self, file_id: int, owner_id: int, tag_ids: list[int]) -> list[Tag]:
        return self._port.set_file_tags(file_id, owner_id, tag_ids)
