from apps.tags_module.application.ports.tag_port import TagPort
from apps.tags_module.domain.tag import TAG_COLORS


class UpdateTagUseCase:
    def __init__(self, repo: TagPort):
        self._repo = repo

    def execute(self, tag_id: int, owner_id: int,
                name: str | None, color: str | None):
        if name is not None:
            name = name.strip()
            if not name:
                raise ValueError("El nombre no puede estar vacío.")
            if len(name) > 50:
                raise ValueError("El nombre no puede superar 50 caracteres.")
        if color is not None and color not in TAG_COLORS:
            raise ValueError("Color no válido.")
        return self._repo.update(tag_id, owner_id, name, color)
