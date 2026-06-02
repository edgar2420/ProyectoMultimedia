from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from apps.tags_module.application.use_cases.create_tag import CreateTagUseCase
from apps.tags_module.application.use_cases.list_tags import ListTagsUseCase
from apps.tags_module.application.use_cases.delete_tag import DeleteTagUseCase
from apps.tags_module.application.use_cases.set_file_tags import SetFileTagsUseCase
from apps.tags_module.application.use_cases.update_tag import UpdateTagUseCase
from apps.tags_module.application.use_cases.bulk_set_tags import BulkSetTagsUseCase
from apps.tags_module.infrastructure.repositories.django_tag_repository import DjangoTagRepository
from apps.tags_module.domain.tag import TAG_COLORS
from .serializers import TagSerializer


def _repo():
    return DjangoTagRepository()


# ── Tags CRUD ─────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_tags(request):
    tags = ListTagsUseCase(_repo()).execute(request.user.id)
    return Response(TagSerializer(tags, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_tag(request):
    name  = request.data.get("name", "").strip()
    color = request.data.get("color", "#5ccb5f")
    try:
        tag = CreateTagUseCase(_repo()).execute(name, color, request.user.id)
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(TagSerializer(tag).data, status=status.HTTP_201_CREATED)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_tag(request, tag_id: int):
    try:
        DeleteTagUseCase(_repo()).execute(tag_id, request.user.id)
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def tag_colors(request):
    """Devuelve la paleta de colores disponibles."""
    return Response(TAG_COLORS)


# ── Tags en archivos ──────────────────────────────────────────────────────────

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_tag(request, tag_id: int):
    name  = request.data.get("name")
    color = request.data.get("color")
    if name is not None:
        name = name.strip()
    try:
        tag = UpdateTagUseCase(_repo()).execute(tag_id, request.user.id, name, color)
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(TagSerializer(tag).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def bulk_set_tags(request):
    file_ids = request.data.get("file_ids", [])
    tag_ids  = request.data.get("tag_ids", [])
    if not isinstance(file_ids, list) or not isinstance(tag_ids, list):
        return Response({"detail": "file_ids y tag_ids deben ser listas."},
                        status=status.HTTP_400_BAD_REQUEST)
    try:
        BulkSetTagsUseCase(_repo()).execute(file_ids, request.user.id, tag_ids)
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response({"ok": True})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_file_tags(request, file_id: int):
    try:
        tags = _repo().get_file_tags(file_id, request.user.id)
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)
    return Response(TagSerializer(tags, many=True).data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def set_file_tags(request, file_id: int):
    """Reemplaza todas las etiquetas de un archivo."""
    tag_ids = request.data.get("tag_ids", [])
    if not isinstance(tag_ids, list):
        return Response({"detail": "tag_ids debe ser una lista."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        tags = SetFileTagsUseCase(_repo()).execute(file_id, request.user.id, tag_ids)
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(TagSerializer(tags, many=True).data)
