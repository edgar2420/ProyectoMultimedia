from apps.tags_module.application.ports.tag_port import TagPort


class BulkSetTagsUseCase:
    def __init__(self, repo: TagPort):
        self._repo = repo

    def execute(self, file_ids: list[int], owner_id: int,
                tag_ids: list[int]) -> None:
        if not file_ids:
            raise ValueError("No hay archivos seleccionados.")
        self._repo.bulk_add_tags(file_ids, owner_id, tag_ids)
