from dataclasses import dataclass


@dataclass
class VideoMetadata:
    # Dimensiones y duración
    width: int
    height: int
    duration_seconds: float
    # Formato
    format_name: str           # mp4, avi, mov, webm…
    format_long_name: str
    # Video stream
    video_codec: str           # h264, vp9, hevc…
    fps: float
    bitrate_kbps: int
    # Audio stream
    audio_codec: str | None
    audio_channels: int | None
    audio_sample_rate: int | None
    # Extra
    has_audio: bool
    file_size: int

    @property
    def duration_str(self) -> str:
        total = int(self.duration_seconds)
        h = total // 3600
        m = (total % 3600) // 60
        s = total % 60
        if h > 0:
            return f"{h:02d}:{m:02d}:{s:02d}"
        return f"{m:02d}:{s:02d}"

    @property
    def resolution(self) -> str:
        return f"{self.width}×{self.height}"

    @property
    def fps_str(self) -> str:
        return f"{self.fps:.2f}".rstrip("0").rstrip(".")

    def to_dict(self) -> dict:
        return {
            "width": self.width,
            "height": self.height,
            "duration_seconds": round(self.duration_seconds, 3),
            "duration_str": self.duration_str,
            "format_name": self.format_name,
            "format_long_name": self.format_long_name,
            "video_codec": self.video_codec,
            "fps": self.fps,
            "fps_str": self.fps_str,
            "bitrate_kbps": self.bitrate_kbps,
            "audio_codec": self.audio_codec,
            "audio_channels": self.audio_channels,
            "audio_sample_rate": self.audio_sample_rate,
            "has_audio": self.has_audio,
            "file_size": self.file_size,
            "resolution": self.resolution,
        }
