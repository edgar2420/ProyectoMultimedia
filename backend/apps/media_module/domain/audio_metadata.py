from dataclasses import dataclass


@dataclass
class AudioMetadata:
    # Técnico
    duration_seconds: float
    codec: str               # mp3, aac, flac, vorbis, opus…
    bitrate_kbps: int
    sample_rate: int         # Hz: 44100, 48000, 96000…
    channels: int            # 1=mono, 2=stereo, >2=surround
    format_name: str         # mp3, ogg, flac, wav, m4a…
    file_size: int
    # Tags ID3 / Vorbis / APEv2 (None si no disponible)
    title: str | None
    artist: str | None
    album: str | None
    album_artist: str | None
    year: str | None
    genre: str | None
    track_number: str | None
    comment: str | None
    composer: str | None

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
    def channels_str(self) -> str:
        return {1: "Mono", 2: "Estéreo"}.get(self.channels, f"{self.channels} canales")

    def to_dict(self) -> dict:
        return {
            "duration_seconds": round(self.duration_seconds, 3),
            "duration_str": self.duration_str,
            "codec": self.codec,
            "bitrate_kbps": self.bitrate_kbps,
            "sample_rate": self.sample_rate,
            "channels": self.channels,
            "channels_str": self.channels_str,
            "format_name": self.format_name,
            "file_size": self.file_size,
            "title": self.title,
            "artist": self.artist,
            "album": self.album,
            "album_artist": self.album_artist,
            "year": self.year,
            "genre": self.genre,
            "track_number": self.track_number,
            "comment": self.comment,
            "composer": self.composer,
        }
