import io
from typing import BinaryIO
from django.db.models import Q
from django.conf import settings

from apps.media_module.application.ports.media_file_port import MediaFilePort
from apps.media_module.domain.media_file import MediaFile, get_file_type
from apps.media_module.infrastructure.models import MediaFileModel
from apps.media_module.infrastructure.storage.storage_port import StoragePort
from apps.media_module.infrastructure.storage.local_storage_adapter import LocalStorageAdapter
from apps.media_module.infrastructure.image.thumbnail_service import generate_thumbnail
from apps.media_module.infrastructure.image.metadata_extractor import extract_metadata
from apps.media_module.infrastructure.video.ffprobe_extractor import extract_video_metadata_from_bytes
from apps.media_module.infrastructure.video.ffmpeg_thumbnail import generate_video_thumbnail
from apps.media_module.infrastructure.audio.ffprobe_audio_extractor import extract_audio_metadata_from_bytes
from apps.media_module.infrastructure.pdf.pymupdf_extractor import (
    extract_pdf_metadata, generate_pdf_thumbnail
)


def _get_storage() -> StoragePort:
    return LocalStorageAdapter()


def _url(path: str) -> str:
    if not path:
        return ""
    return f"{settings.MEDIA_URL.rstrip('/')}/{path}"


def _to_domain(m: MediaFileModel) -> MediaFile:
    return MediaFile(
        id=m.id,
        name=m.name,
        original_name=m.original_name,
        storage_path=m.storage_path,
        file_url=_url(m.storage_path),
        file_type=get_file_type(m.mime_type).value,
        mime_type=m.mime_type,
        size=m.size,
        owner_id=m.owner_id,
        folder_id=m.folder_id,
        thumbnail_url=_url(m.thumbnail_path) if m.thumbnail_path else None,
        image_metadata=m.image_metadata,
        video_metadata=m.video_metadata,
        audio_metadata=m.audio_metadata,
        pdf_metadata=m.pdf_metadata,
        tags=[{"id": t.id, "name": t.name, "color": t.color}
              for t in m.tags.all()],
        created_at=m.created_at,
        updated_at=m.updated_at,
    )


class DjangoMediaRepository(MediaFilePort):
    def __init__(self, storage: StoragePort | None = None):
        self._storage = storage or _get_storage()

    def save(self, file: BinaryIO, original_name: str, mime_type: str,
             _size: int, owner_id: int, folder_id: int | None) -> MediaFile:

        file_type = get_file_type(mime_type).value
        file_bytes = file.read()

        # ── 1. Guardar original
        stored = self._storage.save(
            io.BytesIO(file_bytes), original_name, subfolder=file_type
        )

        thumbnail_path = ""
        image_metadata_dict = None
        video_metadata_dict = None
        audio_metadata_dict = None
        pdf_metadata_dict = None

        # ── 2. Procesamiento según tipo ──────────────────────────────
        if file_type == "image":
            thumb = generate_thumbnail(file_bytes, original_name, mime_type)
            if thumb:
                thumbnail_path = thumb[0]
            meta = extract_metadata(file_bytes, mime_type)
            if meta:
                image_metadata_dict = meta.to_dict()

        elif file_type == "video":
            video_meta = extract_video_metadata_from_bytes(file_bytes, mime_type)
            if video_meta:
                video_metadata_dict = video_meta.to_dict()
                thumb = generate_video_thumbnail(
                    file_bytes, mime_type,
                    duration_seconds=video_meta.duration_seconds,
                )
                if thumb:
                    thumbnail_path = thumb[0]

        elif file_type == "audio":
            audio_meta = extract_audio_metadata_from_bytes(file_bytes, mime_type)
            if audio_meta:
                audio_metadata_dict = audio_meta.to_dict()

        elif file_type == "document":
            pdf_meta = extract_pdf_metadata(file_bytes, mime_type)
            if pdf_meta:
                pdf_metadata_dict = pdf_meta.to_dict()
            thumb = generate_pdf_thumbnail(file_bytes, mime_type)
            if thumb:
                thumbnail_path = thumb[0]

        # ── 3. Persistir ─────────────────────────────────────────────
        instance = MediaFileModel.objects.create(
            name=original_name,
            original_name=original_name,
            storage_path=stored.storage_path,
            thumbnail_path=thumbnail_path,
            file_type=file_type,
            mime_type=mime_type,
            size=stored.size,
            owner_id=owner_id,
            folder_id=folder_id,
            image_metadata=image_metadata_dict,
            video_metadata=video_metadata_dict,
            audio_metadata=audio_metadata_dict,
            pdf_metadata=pdf_metadata_dict,
        )
        return _to_domain(instance)

    def list_by_owner(self, owner_id: int, folder_id: int | None,
                      file_type: str | None, search: str | None,
                      ordering: str = "-created_at",
                      tag_ids: list[int] | None = None) -> list[MediaFile]:
        qs = MediaFileModel.objects.filter(owner_id=owner_id)
        if folder_id is not None:
            qs = qs.filter(folder_id=folder_id)
        else:
            qs = qs.filter(folder__isnull=True)
        if file_type:
            qs = qs.filter(file_type=file_type)
        if search:
            qs = qs.filter(Q(original_name__icontains=search))
        if tag_ids:
            for tid in tag_ids:
                qs = qs.filter(tags__id=tid)
            qs = qs.distinct()
        return [_to_domain(m) for m in qs.prefetch_related("tags").order_by(ordering)]

    def get_by_id(self, file_id: int, owner_id: int) -> MediaFile:
        try:
            m = MediaFileModel.objects.prefetch_related("tags").get(
                id=file_id, owner_id=owner_id
            )
            return _to_domain(m)
        except MediaFileModel.DoesNotExist:
            raise ValueError("Archivo no encontrado.")

    def move_to_folder(self, file_id: int, owner_id: int,
                       folder_id: int | None) -> MediaFile:
        try:
            m = MediaFileModel.objects.get(id=file_id, owner_id=owner_id)
        except MediaFileModel.DoesNotExist:
            raise ValueError("Archivo no encontrado.")
        m.folder_id = folder_id
        m.save(update_fields=["folder_id", "updated_at"])
        return _to_domain(m)

    def delete(self, file_id: int, owner_id: int) -> None:
        try:
            m = MediaFileModel.objects.get(id=file_id, owner_id=owner_id)
        except MediaFileModel.DoesNotExist:
            raise ValueError("Archivo no encontrado.")
        self._storage.delete(m.storage_path)
        if m.thumbnail_path:
            self._storage.delete(m.thumbnail_path)
        m.delete()

    def search(self, owner_id: int, params: dict) -> tuple[list[MediaFile], int]:
        SORT_MAP = {"name": "original_name", "date": "created_at",
                    "size": "size", "type": "file_type"}
        sort_by    = params.get("sort_by", "date")
        sort_order = params.get("sort_order", "desc")
        sort_field = SORT_MAP.get(sort_by, "created_at")
        ordering   = sort_field if sort_order == "asc" else f"-{sort_field}"

        qs = MediaFileModel.objects.filter(owner_id=owner_id)

        # ── Filtros generales ───────────────────────────────────────────
        if q := params.get("q"):
            qs = qs.filter(Q(original_name__icontains=q))

        # type puede ser string único o lista
        types = params.get("types") or ([params.get("type")] if params.get("type") else [])
        if types:
            qs = qs.filter(file_type__in=types)

        if date_from := params.get("date_from"):
            qs = qs.filter(created_at__date__gte=date_from)

        if date_to := params.get("date_to"):
            qs = qs.filter(created_at__date__lte=date_to)

        if min_size := params.get("min_size"):
            qs = qs.filter(size__gte=int(min_size))

        if max_size := params.get("max_size"):
            qs = qs.filter(size__lte=int(max_size))

        tag_ids = params.get("tag_ids") or []
        for tid in tag_ids:
            qs = qs.filter(tags__id=tid)
        if tag_ids:
            qs = qs.distinct()

        # ── Filtros imagen ──────────────────────────────────────────────
        if min_width := params.get("min_width"):
            qs = qs.filter(image_metadata__width__gte=int(min_width))

        if max_width := params.get("max_width"):
            qs = qs.filter(image_metadata__width__lte=int(max_width))

        if min_height := params.get("min_height"):
            qs = qs.filter(image_metadata__height__gte=int(min_height))

        if max_height := params.get("max_height"):
            qs = qs.filter(image_metadata__height__lte=int(max_height))

        if camera_make := params.get("camera_make"):
            qs = qs.filter(image_metadata__camera_make__icontains=camera_make)

        if params.get("has_exif") is True:
            qs = qs.filter(image_metadata__has_exif=True)

        # ── Filtros video ───────────────────────────────────────────────
        if min_duration := params.get("min_duration"):
            qs = qs.filter(video_metadata__duration_seconds__gte=float(min_duration))

        if max_duration := params.get("max_duration"):
            qs = qs.filter(video_metadata__duration_seconds__lte=float(max_duration))

        if video_codec := params.get("video_codec"):
            qs = qs.filter(video_metadata__video_codec__icontains=video_codec)

        if min_fps := params.get("min_fps"):
            qs = qs.filter(video_metadata__fps__gte=float(min_fps))

        if params.get("has_audio") is True:
            qs = qs.filter(video_metadata__has_audio=True)

        if min_video_width := params.get("min_video_width"):
            qs = qs.filter(video_metadata__width__gte=int(min_video_width))

        # ── Filtros audio ───────────────────────────────────────────────
        if min_audio_duration := params.get("min_audio_duration"):
            qs = qs.filter(audio_metadata__duration_seconds__gte=float(min_audio_duration))

        if max_audio_duration := params.get("max_audio_duration"):
            qs = qs.filter(audio_metadata__duration_seconds__lte=float(max_audio_duration))

        if artist := params.get("artist"):
            qs = qs.filter(audio_metadata__artist__icontains=artist)

        if album := params.get("album"):
            qs = qs.filter(audio_metadata__album__icontains=album)

        if genre := params.get("genre"):
            qs = qs.filter(audio_metadata__genre__icontains=genre)

        if audio_codec := params.get("audio_codec"):
            qs = qs.filter(audio_metadata__codec__icontains=audio_codec)

        # ── Filtros PDF ─────────────────────────────────────────────────
        if min_pages := params.get("min_pages"):
            qs = qs.filter(pdf_metadata__page_count__gte=int(min_pages))

        if max_pages := params.get("max_pages"):
            qs = qs.filter(pdf_metadata__page_count__lte=int(max_pages))

        if pdf_author := params.get("pdf_author"):
            qs = qs.filter(pdf_metadata__author__icontains=pdf_author)

        if pdf_title := params.get("pdf_title"):
            qs = qs.filter(pdf_metadata__title__icontains=pdf_title)

        total  = qs.count()
        limit  = int(params.get("limit") or 30)
        offset = int(params.get("offset") or 0)
        qs = qs.prefetch_related("tags").order_by(ordering)[offset: offset + limit]
        return [_to_domain(m) for m in qs], total
