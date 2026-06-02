from dataclasses import dataclass
from datetime import datetime

# Paleta de colores disponibles para etiquetas
TAG_COLORS = [
    "#ef4444",  # red
    "#f97316",  # orange
    "#f59e0b",  # amber
    "#10b981",  # emerald
    "#5ccb5f",  # brand-green
    "#3b82f6",  # blue
    "#8b5cf6",  # violet
    "#ec4899",  # pink
    "#06b6d4",  # cyan
    "#6b7280",  # gray
]

DEFAULT_COLOR = "#5ccb5f"


@dataclass
class Tag:
    id: int
    name: str
    color: str
    owner_id: int
    file_count: int
    created_at: datetime


@dataclass
class FileTag:
    """Asociación entre un archivo y sus etiquetas."""
    file_id: int
    tags: list[Tag]
