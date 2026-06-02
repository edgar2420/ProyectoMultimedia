from apps.tags_module.application.ports.tag_port import TagPort
from apps.tags_module.domain.tag import Tag
from apps.tags_module.infrastructure.models import TagModel
from apps.media_module.infrastructure.models import MediaFileModel


def _to_domain(m: TagModel) -> Tag:
    return Tag(
        id=m.id,
        name=m.name,
        color=m.color,
        owner_id=m.owner_id,
        file_count=m.files.count(),
        created_at=m.created_at,
    )


class DjangoTagRepository(TagPort):
    def create(self, name: str, color: str, owner_id: int) -> Tag:
        tag = TagModel.objects.create(name=name, color=color, owner_id=owner_id)
        return _to_domain(tag)

    def list_by_owner(self, owner_id: int) -> list[Tag]:
        return [_to_domain(t) for t in TagModel.objects.filter(owner_id=owner_id)]

    def get_by_id(self, tag_id: int, owner_id: int) -> Tag:
        try:
            return _to_domain(TagModel.objects.get(id=tag_id, owner_id=owner_id))
        except TagModel.DoesNotExist:
            raise ValueError("Etiqueta no encontrada.")

    def delete(self, tag_id: int, owner_id: int) -> None:
        try:
            TagModel.objects.get(id=tag_id, owner_id=owner_id).delete()
        except TagModel.DoesNotExist:
            raise ValueError("Etiqueta no encontrada.")

    def name_exists(self, name: str, owner_id: int) -> bool:
        return TagModel.objects.filter(name=name, owner_id=owner_id).exists()

    def add_tag_to_file(self, tag_id: int, file_id: int, owner_id: int) -> None:
        tag = TagModel.objects.get(id=tag_id, owner_id=owner_id)
        file = MediaFileModel.objects.get(id=file_id, owner_id=owner_id)
        tag.files.add(file)

    def remove_tag_from_file(self, tag_id: int, file_id: int, owner_id: int) -> None:
        tag = TagModel.objects.get(id=tag_id, owner_id=owner_id)
        file = MediaFileModel.objects.get(id=file_id, owner_id=owner_id)
        tag.files.remove(file)

    def get_file_tags(self, file_id: int, owner_id: int) -> list[Tag]:
        try:
            file = MediaFileModel.objects.get(id=file_id, owner_id=owner_id)
        except MediaFileModel.DoesNotExist:
            raise ValueError("Archivo no encontrado.")
        return [_to_domain(t) for t in file.tags.filter(owner_id=owner_id)]

    def set_file_tags(self, file_id: int, owner_id: int, tag_ids: list[int]) -> list[Tag]:
        try:
            file = MediaFileModel.objects.get(id=file_id, owner_id=owner_id)
        except MediaFileModel.DoesNotExist:
            raise ValueError("Archivo no encontrado.")
        tags = TagModel.objects.filter(id__in=tag_ids, owner_id=owner_id)
        file.tags.set(tags)
        return [_to_domain(t) for t in file.tags.filter(owner_id=owner_id)]

    def get_files_by_tag(self, tag_id: int, owner_id: int) -> list[int]:
        try:
            tag = TagModel.objects.get(id=tag_id, owner_id=owner_id)
        except TagModel.DoesNotExist:
            raise ValueError("Etiqueta no encontrada.")
        return list(tag.files.filter(owner_id=owner_id).values_list("id", flat=True))

    def update(self, tag_id: int, owner_id: int,
               name: str | None, color: str | None) -> Tag:
        try:
            tag = TagModel.objects.get(id=tag_id, owner_id=owner_id)
        except TagModel.DoesNotExist:
            raise ValueError("Etiqueta no encontrada.")
        if name is not None:
            tag.name = name
        if color is not None:
            tag.color = color
        tag.save()
        return _to_domain(tag)

    def bulk_add_tags(self, file_ids: list[int], owner_id: int,
                      tag_ids: list[int]) -> None:
        files = MediaFileModel.objects.filter(id__in=file_ids, owner_id=owner_id)
        tags = TagModel.objects.filter(id__in=tag_ids, owner_id=owner_id)
        for f in files:
            f.tags.add(*tags)
