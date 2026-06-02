from dataclasses import dataclass


@dataclass
class PdfMetadata:
    page_count: int
    file_size: int
    # Info del documento (pueden ser None si el PDF no las incluye)
    title: str | None
    author: str | None
    subject: str | None
    creator: str | None         # app que creó el PDF
    producer: str | None        # librería que generó el PDF
    creation_date: str | None
    modification_date: str | None
    # Seguridad
    encrypted: bool
    # Tamaño de la primera página (puntos → mm a 72 dpi)
    page_width_pt: float | None
    page_height_pt: float | None

    @property
    def page_size_str(self) -> str | None:
        if not self.page_width_pt or not self.page_height_pt:
            return None
        mm_w = round(self.page_width_pt * 25.4 / 72, 1)
        mm_h = round(self.page_height_pt * 25.4 / 72, 1)
        # Detectar tamaño estándar
        if 208 <= mm_w <= 212 and 295 <= mm_h <= 299:
            return "A4"
        if 215 <= mm_w <= 219 and 278 <= mm_h <= 282:
            return "Carta"
        return f"{mm_w}×{mm_h} mm"

    def to_dict(self) -> dict:
        return {
            "page_count": self.page_count,
            "file_size": self.file_size,
            "title": self.title,
            "author": self.author,
            "subject": self.subject,
            "creator": self.creator,
            "producer": self.producer,
            "creation_date": self.creation_date,
            "modification_date": self.modification_date,
            "encrypted": self.encrypted,
            "page_width_pt": self.page_width_pt,
            "page_height_pt": self.page_height_pt,
            "page_size_str": self.page_size_str,
        }
