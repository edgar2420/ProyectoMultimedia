from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from apps.media_module.application.use_cases.create_folder import CreateFolderUseCase
from apps.media_module.application.use_cases.list_folders import ListFoldersUseCase
from apps.media_module.application.use_cases.delete_folder import DeleteFolderUseCase
from apps.media_module.application.use_cases.rename_folder import RenameFolderUseCase
from apps.media_module.infrastructure.repositories.django_folder_repository import DjangoFolderRepository
from .serializers import FolderSerializer


def _repo():
    return DjangoFolderRepository()


# ── helpers ──────────────────────────────────────────────────────────────────

def _parse_parent_id(raw) -> int | None:
    if raw is None:
        return None
    try:
        return int(raw)
    except (ValueError, TypeError):
        raise ValueError("parent_id inválido.")


def _build_tree(folders: list, parent_id: int | None = None) -> list[dict]:
    """Construye recursivamente el árbol de carpetas en memoria."""
    result = []
    for f in folders:
        if f.parent_id == parent_id:
            node = {
                "id": f.id,
                "name": f.name,
                "parent_id": f.parent_id,
                "children_count": f.children_count,
                "files_count": f.files_count,
                "children": _build_tree(folders, f.id),
            }
            result.append(node)
    return sorted(result, key=lambda x: x["name"].lower())


# ── endpoints ─────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_folders(request):
    try:
        parent_id = _parse_parent_id(request.query_params.get("parent_id"))
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    folders = ListFoldersUseCase(_repo()).execute(request.user.id, parent_id)
    return Response(FolderSerializer(folders, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def folder_tree(request):
    """Devuelve el árbol completo de carpetas del usuario."""
    all_folders = _repo().get_all_by_owner(request.user.id)
    tree = _build_tree(all_folders, parent_id=None)
    return Response(tree)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_folder(request):
    name = request.data.get("name", "").strip()
    try:
        parent_id = _parse_parent_id(request.data.get("parent_id"))
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    try:
        folder = CreateFolderUseCase(_repo()).execute(name, request.user.id, parent_id)
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response(FolderSerializer(folder).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def folder_detail(request, folder_id: int):
    try:
        folder = _repo().get_by_id(folder_id, request.user.id)
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)
    return Response(FolderSerializer(folder).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def folder_breadcrumb(request, folder_id: int):
    ancestors = _repo().get_ancestors(folder_id, request.user.id)
    return Response(FolderSerializer(ancestors, many=True).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def rename_folder(request, folder_id: int):
    new_name = request.data.get("name", "").strip()
    try:
        folder = RenameFolderUseCase(_repo()).execute(folder_id, request.user.id, new_name)
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(FolderSerializer(folder).data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_folder(request, folder_id: int):
    try:
        DeleteFolderUseCase(_repo()).execute(folder_id, request.user.id)
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)
    return Response(status=status.HTTP_204_NO_CONTENT)
