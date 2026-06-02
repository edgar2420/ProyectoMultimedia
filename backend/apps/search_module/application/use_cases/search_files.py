import time
from apps.search_module.domain.search_result import SearchFilters, SearchResult
from apps.search_module.infrastructure.django_search_repository import DjangoSearchRepository


class SearchFilesUseCase:
    def __init__(self, repo: DjangoSearchRepository):
        self._repo = repo

    def execute(self, owner_id: int, filters: SearchFilters,
                limit: int = 30, offset: int = 0) -> SearchResult:
        limit = min(max(1, limit), 100)
        offset = max(0, offset)
        t0 = time.monotonic()
        total, files = self._repo.search(owner_id, filters, limit, offset)
        took_ms = int((time.monotonic() - t0) * 1000)
        return SearchResult(
            total=total,
            files=files,
            query=filters.query,
            took_ms=took_ms,
        )
