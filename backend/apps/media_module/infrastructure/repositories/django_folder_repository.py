from apps.media_module.application.ports.folder_port import FolderPort
from apps.media_module.domain.folder import Folder
from apps.media_module.infrastructure.models import FolderModel


def _to_domain(m: FolderModel) -> Folder:
    return Folder(
        id=m.id,
        name=m.name,
        owner_id=m.owner_id,
        parent_id=m.parent_id,
        created_at=m.created_at,
        updated_at=m.updated_at,
        children_count=m.children.count(),
        files_count=m.files.count(),
    )


class DjangoFolderRepository(FolderPort):
    def create(self, name: str, owner_id: int, parent_id: int | None) -> Folder:
        folder = FolderModel.objects.create(
            name=name, owner_id=owner_id, parent_id=parent_id
        )
        return _to_domain(folder)

    def list_by_owner(self, owner_id: int, parent_id: int | None) -> list[Folder]:
        qs = FolderModel.objects.filter(owner_id=owner_id, parent_id=parent_id)
        return [_to_domain(f) for f in qs]

    def get_by_id(self, folder_id: int, owner_id: int) -> Folder:
        try:
            return _to_domain(FolderModel.objects.get(id=folder_id, owner_id=owner_id))
        except FolderModel.DoesNotExist:
            raise ValueError("Carpeta no encontrada.")

    def get_ancestors(self, folder_id: int, owner_id: int) -> list[Folder]:
        ancestors: list[Folder] = []
        current_id: int | None = folder_id
        while current_id is not None:
            try:
                folder = FolderModel.objects.get(id=current_id, owner_id=owner_id)
                ancestors.insert(0, _to_domain(folder))
                current_id = folder.parent_id
            except FolderModel.DoesNotExist:
                break
        return ancestors

    def get_all_by_owner(self, owner_id: int) -> list[Folder]:
        qs = FolderModel.objects.filter(owner_id=owner_id).order_by("name")
        return [_to_domain(f) for f in qs]

    def rename(self, folder_id: int, owner_id: int, new_name: str) -> Folder:
        try:
            folder = FolderModel.objects.get(id=folder_id, owner_id=owner_id)
        except FolderModel.DoesNotExist:
            raise ValueError("Carpeta no encontrada.")
        folder.name = new_name
        folder.save(update_fields=["name", "updated_at"])
        return _to_domain(folder)

    def delete(self, folder_id: int, owner_id: int) -> None:
        try:
            FolderModel.objects.get(id=folder_id, owner_id=owner_id).delete()
        except FolderModel.DoesNotExist:
            raise ValueError("Carpeta no encontrada.")

    def name_exists_in_parent(self, name: str, owner_id: int,
                               parent_id: int | None) -> bool:
        return FolderModel.objects.filter(
            name=name, owner_id=owner_id, parent_id=parent_id
        ).exists()
