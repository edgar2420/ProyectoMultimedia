from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class Folder:
    id: int
    name: str
    owner_id: int
    parent_id: int | None
    created_at: datetime
    updated_at: datetime
    children_count: int = 0
    files_count: int = 0

    @property
    def is_root(self) -> bool:
        return self.parent_id is None
