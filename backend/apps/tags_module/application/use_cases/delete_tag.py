from apps.tags_module.application.ports.tag_port import TagPort


class DeleteTagUseCase:
    def __init__(self, port: TagPort):
        self._port = port

    def execute(self, tag_id: int, owner_id: int) -> None:
        self._port.delete(tag_id, owner_id)
