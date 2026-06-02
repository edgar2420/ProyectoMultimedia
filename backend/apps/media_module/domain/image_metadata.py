from dataclasses import dataclass, field


@dataclass
class ImageMetadata:
    # Dimensiones
    width: int
    height: int
    format: str           # JPEG, PNG, GIF, WEBP…
    color_mode: str       # RGB, RGBA, L…
    # EXIF básico (None si no disponible)
    camera_make: str | None = None
    camera_model: str | None = None
    date_taken: str | None = None
    exposure_time: str | None = None
    f_number: str | None = None
    iso_speed: int | None = None
    focal_length: str | None = None
    flash: str | None = None
    # GPS (None si no disponible)
    gps_latitude: float | None = None
    gps_longitude: float | None = None
    # Extra
    software: str | None = None
    orientation: int | None = None
    has_exif: bool = False

    @property
    def megapixels(self) -> float:
        return round((self.width * self.height) / 1_000_000, 2)

    @property
    def aspect_ratio(self) -> str:
        from math import gcd
        g = gcd(self.width, self.height)
        return f"{self.width // g}:{self.height // g}"

    def to_dict(self) -> dict:
        return {
            "width": self.width,
            "height": self.height,
            "format": self.format,
            "color_mode": self.color_mode,
            "megapixels": self.megapixels,
            "aspect_ratio": self.aspect_ratio,
            "camera_make": self.camera_make,
            "camera_model": self.camera_model,
            "date_taken": self.date_taken,
            "exposure_time": self.exposure_time,
            "f_number": self.f_number,
            "iso_speed": self.iso_speed,
            "focal_length": self.focal_length,
            "flash": self.flash,
            "gps_latitude": self.gps_latitude,
            "gps_longitude": self.gps_longitude,
            "software": self.software,
            "orientation": self.orientation,
            "has_exif": self.has_exif,
        }
