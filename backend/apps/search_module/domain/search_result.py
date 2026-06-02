from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class SearchFilters:
    query: str = ""
    file_types: list[str] = field(default_factory=list)
    tag_ids: list[int] = field(default_factory=list)
    date_from: datetime | None = None
    date_to: datetime | None = None
    min_size: int | None = None     # bytes
    max_size: int | None = None     # bytes
    folder_id: int | None = None    # None = buscar en todas las carpetas
    search_metadata: bool = True    # buscar también dentro de metadata JSON


@dataclass
class SearchResult:
    total: int
    files: list         # list[MediaFile] — evita circular import
    query: str
    took_ms: int = 0    # tiempo de búsqueda en ms (informativo)
