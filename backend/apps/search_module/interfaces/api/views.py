from datetime import datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.search_module.domain.search_result import SearchFilters
from apps.search_module.application.use_cases.search_files import SearchFilesUseCase
from apps.search_module.infrastructure.django_search_repository import DjangoSearchRepository
from apps.media_module.interfaces.api.serializers import MediaFileSerializer


def _parse_date(raw: str | None) -> datetime | None:
    if not raw:
        return None
    try:
        return datetime.fromisoformat(raw)
    except ValueError:
        return None


def _parse_int(raw: str | None) -> int | None:
    try:
        return int(raw) if raw is not None else None
    except ValueError:
        return None


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search(request):
    params = request.query_params

    # Tipos de archivo (acepta múltiples: ?type=image&type=video  o  ?type=image,video)
    raw_types = params.getlist("type")
    file_types = []
    for t in raw_types:
        file_types.extend([x.strip() for x in t.split(",") if x.strip()])

    # Tag IDs (acepta múltiples: ?tag_id=1&tag_id=2)
    tag_ids = []
    for raw in params.getlist("tag_id"):
        v = _parse_int(raw)
        if v is not None:
            tag_ids.append(v)

    # Folder ID (None = todas las carpetas)
    folder_id_raw = params.get("folder_id")
    if folder_id_raw == "" or folder_id_raw == "null":
        folder_id = None
    else:
        folder_id = _parse_int(folder_id_raw)

    filters = SearchFilters(
        query=params.get("q", "").strip(),
        file_types=file_types,
        tag_ids=tag_ids,
        date_from=_parse_date(params.get("date_from")),
        date_to=_parse_date(params.get("date_to")),
        min_size=_parse_int(params.get("min_size")),
        max_size=_parse_int(params.get("max_size")),
        folder_id=folder_id,
        search_metadata=params.get("search_metadata", "true").lower() != "false",
    )

    limit = min(int(params.get("limit", 30)), 100)
    offset = max(int(params.get("offset", 0)), 0)

    result = SearchFilesUseCase(DjangoSearchRepository()).execute(
        request.user.id, filters, limit, offset
    )

    return Response({
        "total": result.total,
        "took_ms": result.took_ms,
        "query": result.query,
        "limit": limit,
        "offset": offset,
        "results": MediaFileSerializer(result.files, many=True).data,
    })
