from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status

from apps.media_module.application.use_cases.upload_file import UploadFileUseCase
from apps.media_module.application.use_cases.delete_file import DeleteFileUseCase
from apps.media_module.application.use_cases.search_files import SearchFilesUseCase
from apps.media_module.infrastructure.repositories.django_media_repository import DjangoMediaRepository
from .serializers import MediaFileSerializer


def _repo():
    return DjangoMediaRepository()


def _parse_folder_id(raw) -> int | None:
    if raw is None or raw == "" or raw == "null":
        return None
    try:
        return int(raw)
    except (ValueError, TypeError):
        raise ValueError("folder_id inválido.")


SORT_FIELD_MAP = {
    "name":    "original_name",
    "date":    "created_at",
    "size":    "size",
    "type":    "file_type",
}

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def stats(request):
    """Estadísticas globales del usuario: total archivos, tamaño, conteo por tipo."""
    from django.db.models import Count, Sum
    from apps.media_module.infrastructure.models import MediaFileModel

    qs = MediaFileModel.objects.filter(owner_id=request.user.id)
    agg = qs.aggregate(total=Count("id"), total_size=Sum("size"))

    by_type = {
        row["file_type"]: row["cnt"]
        for row in qs.values("file_type").annotate(cnt=Count("id"))
    }

    return Response({
        "total_files": agg["total"] or 0,
        "total_size":  agg["total_size"] or 0,
        "by_type": {
            "image":    by_type.get("image", 0),
            "video":    by_type.get("video", 0),
            "audio":    by_type.get("audio", 0),
            "document": by_type.get("document", 0),
            "other":    by_type.get("other", 0),
        },
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_files(request):
    file_type  = request.query_params.get("type")
    search     = request.query_params.get("search")
    sort_by    = request.query_params.get("sort_by", "date")
    sort_order = request.query_params.get("sort_order", "desc")
    folder_id_raw = request.query_params.get("folder_id")

    try:
        folder_id = _parse_folder_id(folder_id_raw)
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    sort_field = SORT_FIELD_MAP.get(sort_by, "created_at")
    ordering = sort_field if sort_order == "asc" else f"-{sort_field}"

    # Filtrar por etiqueta(s)
    tag_ids_raw = request.query_params.getlist("tag_id")
    tag_ids = []
    for raw in tag_ids_raw:
        try:
            tag_ids.append(int(raw))
        except ValueError:
            pass

    files = _repo().list_by_owner(
        request.user.id, folder_id, file_type, search,
        ordering=ordering, tag_ids=tag_ids or None,
    )
    return Response(MediaFileSerializer(files, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_file(request):
    uploaded = request.FILES.get("file")
    if not uploaded:
        return Response({"detail": "No se envió ningún archivo."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        folder_id = _parse_folder_id(request.data.get("folder_id"))
        media = UploadFileUseCase(_repo()).execute(
            file=uploaded,
            original_name=uploaded.name,
            mime_type=uploaded.content_type,
            size=uploaded.size,
            owner_id=request.user.id,
            folder_id=folder_id,
        )
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response(MediaFileSerializer(media).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_file(request, file_id: int):
    try:
        media = _repo().get_by_id(file_id, request.user.id)
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)
    return Response(MediaFileSerializer(media).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_file_metadata(request, file_id: int):
    try:
        media = _repo().get_by_id(file_id, request.user.id)
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)
    return Response({
        "id": media.id,
        "thumbnail_url": media.thumbnail_url,
        "image_metadata": media.image_metadata,
    })


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def move_file(request, file_id: int):
    try:
        folder_id = _parse_folder_id(request.data.get("folder_id"))
        media = _repo().move_to_folder(file_id, request.user.id, folder_id)
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(MediaFileSerializer(media).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_files(request):
    """Búsqueda avanzada cross-folder con filtros de metadata y paginación."""
    import time

    def _int(key):
        v = request.query_params.get(key)
        try: return int(v) if v not in (None, "") else None
        except (ValueError, TypeError): return None

    def _float(key):
        v = request.query_params.get(key)
        try: return float(v) if v not in (None, "") else None
        except (ValueError, TypeError): return None

    def _str(key):
        v = request.query_params.get(key, "").strip()
        return v or None

    tag_ids_raw = request.query_params.getlist("tag_id")
    tag_ids = [int(x) for x in tag_ids_raw if x.isdigit()]

    # Soporte multi-tipo: ?type=image&type=video  o ?type=image
    types_raw = request.query_params.getlist("type")
    types = [t for t in types_raw if t]

    limit  = _int("limit")  or 30
    offset = _int("offset") or 0

    params = {
        "q":                  _str("q"),
        "types":              types or None,
        "date_from":          _str("date_from"),
        "date_to":            _str("date_to"),
        "min_size":           _int("min_size"),
        "max_size":           _int("max_size"),
        "sort_by":            _str("sort_by") or "date",
        "sort_order":         _str("sort_order") or "desc",
        "tag_ids":            tag_ids or None,
        "limit":              limit,
        "offset":             offset,
        # imagen
        "min_width":          _int("min_width"),
        "max_width":          _int("max_width"),
        "min_height":         _int("min_height"),
        "max_height":         _int("max_height"),
        "camera_make":        _str("camera_make"),
        "has_exif":           True if request.query_params.get("has_exif") == "true" else None,
        # video
        "min_duration":       _float("min_duration"),
        "max_duration":       _float("max_duration"),
        "video_codec":        _str("video_codec"),
        "min_fps":            _float("min_fps"),
        "has_audio":          True if request.query_params.get("has_audio") == "true" else None,
        "min_video_width":    _int("min_video_width"),
        # audio
        "min_audio_duration": _float("min_audio_duration"),
        "max_audio_duration": _float("max_audio_duration"),
        "artist":             _str("artist"),
        "album":              _str("album"),
        "genre":              _str("genre"),
        "audio_codec":        _str("audio_codec"),
        # pdf
        "min_pages":          _int("min_pages"),
        "max_pages":          _int("max_pages"),
        "pdf_author":         _str("pdf_author"),
        "pdf_title":          _str("pdf_title"),
    }

    t0 = time.monotonic()
    files, total = SearchFilesUseCase(_repo()).execute(request.user.id, params)
    took_ms = round((time.monotonic() - t0) * 1000)

    return Response({
        "total":    total,
        "took_ms":  took_ms,
        "query":    params.get("q") or "",
        "limit":    limit,
        "offset":   offset,
        "results":  MediaFileSerializer(files, many=True).data,
    })


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_file(request, file_id: int):
    try:
        DeleteFileUseCase(_repo()).execute(file_id, request.user.id)
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)
    return Response(status=status.HTTP_204_NO_CONTENT)
