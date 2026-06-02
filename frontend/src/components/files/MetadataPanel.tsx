import {
  Camera, Aperture, Zap, Clock, Map, Monitor,
  RotateCw, Info, Video, Music, Film, Disc, FileText, Lock,
} from "lucide-react";
import type { ImageMetadata, VideoMetadata, AudioMetadata, PdfMetadata } from "../../services/files";

interface RowProps {
  label: string;
  value: string | number | null | undefined;
  icon?: React.ReactNode;
}

function MetaRow({ label, value, icon }: RowProps) {
  if (value == null || value === "" || value === "None" || value === "0") return null;
  return (
    <div className="flex items-start justify-between py-2
                    border-b border-zinc-800/50 last:border-0 gap-2">
      <span className="flex items-center gap-1.5 text-xs text-zinc-600 shrink-0">
        {icon && <span className="opacity-60">{icon}</span>}
        {label}
      </span>
      <span className="text-xs text-zinc-300 font-medium text-right break-all">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-2 px-1">
        {title}
      </p>
      <div className="bg-zinc-800/30 rounded-xl px-3">{children}</div>
    </div>
  );
}

// ── Panel imágenes ────────────────────────────────────────────────────────────

export function ImageMetadataPanel({ metadata: m }: { metadata: ImageMetadata }) {
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: "Dimensiones", value: `${m.width} × ${m.height} px` },
          { label: "Megapíxeles", value: `${m.megapixels} MP` },
          { label: "Proporción",  value: m.aspect_ratio },
          { label: "Formato",     value: m.format },
          { label: "Modo color",  value: m.color_mode },
          { label: "EXIF",        value: m.has_exif ? "Disponible" : "No disponible" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-zinc-800/40 rounded-lg px-3 py-2">
            <p className="text-[10px] text-zinc-600 mb-0.5">{label}</p>
            <p className="text-xs font-semibold text-zinc-200">{value}</p>
          </div>
        ))}
      </div>

      {(m.camera_make || m.camera_model || m.software) && (
        <Section title="Cámara / Dispositivo">
          <MetaRow label="Fabricante"  value={m.camera_make}  icon={<Camera size={11} />} />
          <MetaRow label="Modelo"      value={m.camera_model} icon={<Camera size={11} />} />
          <MetaRow label="Software"    value={m.software}     icon={<Monitor size={11} />} />
          <MetaRow label="Orientación" value={m.orientation}  icon={<RotateCw size={11} />} />
        </Section>
      )}

      {(m.exposure_time || m.f_number || m.iso_speed || m.focal_length || m.flash) && (
        <Section title="Configuración de captura">
          <MetaRow label="Exposición" value={m.exposure_time ? `${m.exposure_time} s` : null} icon={<Clock size={11} />} />
          <MetaRow label="Apertura"   value={m.f_number}                                        icon={<Aperture size={11} />} />
          <MetaRow label="ISO"        value={m.iso_speed}                                       icon={<Zap size={11} />} />
          <MetaRow label="Focal"      value={m.focal_length ? `${m.focal_length} mm` : null}   icon={<Camera size={11} />} />
          <MetaRow label="Flash"      value={m.flash}                                           icon={<Zap size={11} />} />
        </Section>
      )}

      {m.date_taken?.trim() && (
        <Section title="Fecha y hora">
          <MetaRow label="Tomada el" value={m.date_taken} icon={<Clock size={11} />} />
        </Section>
      )}

      {m.gps_latitude != null && m.gps_longitude != null && (
        <Section title="Ubicación GPS">
          <MetaRow label="Latitud"  value={`${m.gps_latitude}°`}  icon={<Map size={11} />} />
          <MetaRow label="Longitud" value={`${m.gps_longitude}°`} icon={<Map size={11} />} />
          <div className="py-2">
            <a
              href={`https://www.google.com/maps?q=${m.gps_latitude},${m.gps_longitude}`}
              target="_blank" rel="noreferrer"
              className="text-xs text-brand-400 hover:text-brand-200 transition-colors"
            >
              Ver en Google Maps →
            </a>
          </div>
        </Section>
      )}

      {!m.has_exif && (
        <div className="flex items-center gap-2 bg-zinc-800/30 rounded-xl px-3 py-3 mt-2">
          <Info size={13} className="text-zinc-600 shrink-0" />
          <p className="text-xs text-zinc-600">Esta imagen no contiene datos EXIF.</p>
        </div>
      )}
    </div>
  );
}

// ── Panel videos ──────────────────────────────────────────────────────────────

export function VideoMetadataPanel({ metadata: m }: { metadata: VideoMetadata }) {
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: "Resolución",  value: m.resolution },
          { label: "Duración",    value: m.duration_str },
          { label: "Codec video", value: m.video_codec.toUpperCase() },
          { label: "FPS",         value: `${m.fps_str} fps` },
          { label: "Bitrate",     value: `${m.bitrate_kbps} kbps` },
          { label: "Audio",       value: m.has_audio ? "Sí" : "No" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-zinc-800/40 rounded-lg px-3 py-2">
            <p className="text-[10px] text-zinc-600 mb-0.5">{label}</p>
            <p className="text-xs font-semibold text-zinc-200">{value}</p>
          </div>
        ))}
      </div>

      <Section title="Video">
        <MetaRow label="Resolución" value={m.resolution}                    icon={<Film size={11} />} />
        <MetaRow label="Codec"      value={m.video_codec.toUpperCase()}     icon={<Video size={11} />} />
        <MetaRow label="FPS"        value={`${m.fps_str} cuadros/seg`}      icon={<Clock size={11} />} />
        <MetaRow label="Bitrate"    value={`${m.bitrate_kbps} kbps`}        icon={<Zap size={11} />} />
        <MetaRow label="Formato"    value={m.format_name.toUpperCase()}     icon={<Film size={11} />} />
        <MetaRow label="Duración"   value={`${m.duration_str} (${Math.round(m.duration_seconds)}s)`} icon={<Clock size={11} />} />
      </Section>

      {m.has_audio && (
        <Section title="Audio">
          <MetaRow label="Codec"       value={m.audio_codec?.toUpperCase()}  icon={<Music size={11} />} />
          <MetaRow
            label="Canales"
            value={m.audio_channels === 1 ? "Mono" : m.audio_channels === 2 ? "Estéreo" : String(m.audio_channels ?? "")}
            icon={<Music size={11} />}
          />
          <MetaRow label="Sample rate" value={m.audio_sample_rate ? `${m.audio_sample_rate} Hz` : null} icon={<Music size={11} />} />
        </Section>
      )}

      {!m.has_audio && (
        <div className="flex items-center gap-2 bg-zinc-800/30 rounded-xl px-3 py-3">
          <Info size={13} className="text-zinc-600 shrink-0" />
          <p className="text-xs text-zinc-600">Este video no tiene pista de audio.</p>
        </div>
      )}
    </div>
  );
}

// ── Panel audio ───────────────────────────────────────────────────────────────

export function AudioMetadataPanel({ metadata: m }: { metadata: AudioMetadata }) {
  return (
    <div className="space-y-1">
      {/* Resumen visual */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: "Duración",    value: m.duration_str },
          { label: "Codec",       value: m.codec.toUpperCase() },
          { label: "Bitrate",     value: `${m.bitrate_kbps} kbps` },
          { label: "Sample rate", value: `${m.sample_rate} Hz` },
          { label: "Canales",     value: m.channels_str },
          { label: "Formato",     value: m.format_name.toUpperCase() },
        ].map(({ label, value }) => (
          <div key={label} className="bg-zinc-800/40 rounded-lg px-3 py-2">
            <p className="text-[10px] text-zinc-600 mb-0.5">{label}</p>
            <p className="text-xs font-semibold text-zinc-200">{value}</p>
          </div>
        ))}
      </div>

      {/* Tags ID3 */}
      {(m.title || m.artist || m.album || m.genre || m.year || m.composer) && (
        <Section title="Etiquetas ID3">
          <MetaRow label="Título"      value={m.title}       icon={<Music size={11} />} />
          <MetaRow label="Artista"     value={m.artist}      icon={<Music size={11} />} />
          <MetaRow label="Álbum"       value={m.album}       icon={<Disc size={11} />} />
          <MetaRow label="Álb. artista" value={m.album_artist} icon={<Music size={11} />} />
          <MetaRow label="Año"         value={m.year}        icon={<Clock size={11} />} />
          <MetaRow label="Género"      value={m.genre}       icon={<Music size={11} />} />
          <MetaRow label="Pista"       value={m.track_number} icon={<Disc size={11} />} />
          <MetaRow label="Compositor"  value={m.composer}    icon={<Music size={11} />} />
          <MetaRow label="Comentario"  value={m.comment}     icon={<Info size={11} />} />
        </Section>
      )}

      {/* Técnico */}
      <Section title="Técnico">
        <MetaRow label="Codec"       value={m.codec.toUpperCase()}    icon={<Music size={11} />} />
        <MetaRow label="Bitrate"     value={`${m.bitrate_kbps} kbps`} icon={<Zap size={11} />} />
        <MetaRow label="Sample rate" value={`${m.sample_rate} Hz`}    icon={<Zap size={11} />} />
        <MetaRow label="Canales"     value={m.channels_str}           icon={<Music size={11} />} />
        <MetaRow label="Formato"     value={m.format_name.toUpperCase()} icon={<Film size={11} />} />
        <MetaRow label="Duración"    value={`${m.duration_str} (${Math.round(m.duration_seconds)}s)`} icon={<Clock size={11} />} />
      </Section>
    </div>
  );
}

// ── Panel PDF ─────────────────────────────────────────────────────────────────

export function PdfMetadataPanel({ metadata: m }: { metadata: PdfMetadata }) {
  return (
    <div className="space-y-1">
      {/* Resumen visual */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: "Páginas",    value: String(m.page_count) },
          { label: "Tamaño",     value: m.page_size_str ?? "—" },
          { label: "Encriptado", value: m.encrypted ? "Sí" : "No" },
          { label: "Formato",    value: "PDF" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-zinc-800/40 rounded-lg px-3 py-2">
            <p className="text-[10px] text-zinc-600 mb-0.5">{label}</p>
            <p className="text-xs font-semibold text-zinc-200">{value}</p>
          </div>
        ))}
      </div>

      {/* Información del documento */}
      {(m.title || m.author || m.subject || m.creator || m.producer) && (
        <Section title="Información del documento">
          <MetaRow label="Título"    value={m.title}    icon={<FileText size={11} />} />
          <MetaRow label="Autor"     value={m.author}   icon={<FileText size={11} />} />
          <MetaRow label="Asunto"    value={m.subject}  icon={<FileText size={11} />} />
          <MetaRow label="Creado con" value={m.creator} icon={<Monitor size={11} />} />
          <MetaRow label="Productor" value={m.producer} icon={<Monitor size={11} />} />
        </Section>
      )}

      {/* Fechas */}
      {(m.creation_date || m.modification_date) && (
        <Section title="Fechas">
          <MetaRow label="Creación"      value={m.creation_date}      icon={<Clock size={11} />} />
          <MetaRow label="Modificación"  value={m.modification_date}  icon={<Clock size={11} />} />
        </Section>
      )}

      {/* Seguridad */}
      {m.encrypted && (
        <div className="flex items-center gap-2 bg-yellow-950/30 border border-yellow-900/30
                        rounded-xl px-3 py-3">
          <Lock size={13} className="text-yellow-500 shrink-0" />
          <p className="text-xs text-yellow-400">Este PDF está encriptado.</p>
        </div>
      )}

      {/* Dimensiones */}
      {m.page_width_pt && m.page_height_pt && (
        <Section title="Dimensiones de página">
          <MetaRow
            label="Tamaño"
            value={`${Math.round(m.page_width_pt * 25.4 / 72)}×${Math.round(m.page_height_pt * 25.4 / 72)} mm`}
            icon={<FileText size={11} />}
          />
          <MetaRow
            label="En puntos"
            value={`${m.page_width_pt}×${m.page_height_pt} pt`}
            icon={<FileText size={11} />}
          />
        </Section>
      )}
    </div>
  );
}

// Alias para retrocompatibilidad
export function MetadataPanel({ metadata }: { metadata: ImageMetadata }) {
  return <ImageMetadataPanel metadata={metadata} />;
}
