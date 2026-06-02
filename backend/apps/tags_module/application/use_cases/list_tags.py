from apps.tags_module.application.ports.tag_port import TagPort
from apps.tags_module.domain.tag import Tag


class ListTagsUseCase:
    def __init__(self, port: TagPort):
        self._port = port

    def execute(self, owner_id: int) -> list[Tag]:
        return self._port.list_by_owner(owner_id)
