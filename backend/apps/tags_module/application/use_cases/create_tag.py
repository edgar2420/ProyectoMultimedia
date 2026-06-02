from apps.tags_module.application.ports.tag_port import TagPort
from apps.tags_module.domain.tag import Tag, TAG_COLORS, DEFAULT_COLOR


class CreateTagUseCase:
    def __init__(self, port: TagPort):
        self._port = port

    def execute(self, name: str, color: str, owner_id: int) -> Tag:
        name = name.strip()
        if not name:
            raise ValueError("El nombre de la etiqueta no puede estar vacío.")
        if len(name) > 50:
            raise ValueError("El nombre no puede superar 50 caracteres.")
        if color not in TAG_COLORS:
            color = DEFAULT_COLOR
        if self._port.name_exists(name, owner_id):
            raise ValueError(f"Ya existe una etiqueta llamada '{name}'.")
        return self._port.create(name, color, owner_id)
