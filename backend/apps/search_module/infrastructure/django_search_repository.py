"""
Repositorio de búsqueda avanzada.
Busca en: nombre, tags, y campos dentro de los JSONFields de metadata.
"""
from django.db.models import Q
from apps.media_module.infrastructure.models import MediaFileModel
from apps.media_module.domain.media_file import get_file_type
from apps.media_module.infrastructure.repositories.django_media_repository import _to_domain
from apps.search_module.domain.search_result import SearchFilters


def _build_query(q: str, search_metadata: bool) -> Q:
    """Construye el Q object para búsqueda full-text."""
    base = Q(original_name__icontains=q)

    if not search_metadata:
        return base

    # Búsqueda en tags (nombre)
    base |= Q(tags__name__icontains=q)

    # Búsqueda en metadata de imágenes
    base |= Q(image_metadata__camera_make__icontains=q)
    base |= Q(image_metadata__camera_model__icontains=q)
    base |= Q(image_metadata__software__icontains=q)

    # Búsqueda en metadata de audio (tags ID3)
    base |= Q(audio_metadata__title__icontains=q)
    base |= Q(audio_metadata__artist__icontains=q)
    base |= Q(audio_metadata__album__icontains=q)
    base |= Q(audio_metadata__album_artist__icontains=q)
    base |= Q(audio_metadata__genre__icontains=q)
    base |= Q(audio_metadata__composer__icontains=q)

    # Búsqueda en metadata de PDF
    base |= Q(pdf_metadata__title__icontains=q)
    base |= Q(pdf_metadata__author__icontains=q)
    base |= Q(pdf_metadata__subject__icontains=q)

    # Búsqueda en metadata de video
    base |= Q(video_metadata__video_codec__icontains=q)
    base |= Q(video_metadata__format_long_name__icontains=q)

    return base


class DjangoSearchRepository:
    def search(self, owner_id: int, filters: SearchFilters,
               limit: int, offset: int) -> tuple[int, list]:

        qs = MediaFileModel.objects.filter(owner_id=owner_id)

        # ── Búsqueda de texto ──────────────────────────────────────────
        if filters.query:
            q_obj = _build_query(filters.query, filters.search_metadata)
            qs = qs.filter(q_obj).distinct()

        # ── Filtro por tipo(s) ────────────────────────────────────────
        if filters.file_types:
            qs = qs.filter(file_type__in=filters.file_types)

        # ── Filtro por etiqueta(s) ────────────────────────────────────
        for tag_id in filters.tag_ids:
            qs = qs.filter(tags__id=tag_id)
        if filters.tag_ids:
            qs = qs.distinct()

        # ── Filtro por rango de fechas ────────────────────────────────
        if filters.date_from:
            qs = qs.filter(created_at__gte=filters.date_from)
        if filters.date_to:
            qs = qs.filter(created_at__lte=filters.date_to)

        # ── Filtro por tamaño ─────────────────────────────────────────
        if filters.min_size is not None:
            qs = qs.filter(size__gte=filters.min_size)
        if filters.max_size is not None:
            qs = qs.filter(size__lte=filters.max_size)

        # ── Filtro por carpeta ────────────────────────────────────────
        if filters.folder_id is not None:
            qs = qs.filter(folder_id=filters.folder_id)
        # folder_id=None → buscar en TODAS las carpetas (sin restricción)

        total = qs.count()
        page = list(qs.prefetch_related("tags").order_by("-created_at")[offset:offset + limit])
        return total, [_to_domain(m) for m in page]
