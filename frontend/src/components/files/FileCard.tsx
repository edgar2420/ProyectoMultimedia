import { useState } from "react";
import { Trash2, Download, ImageIcon, Video, Music, FileText, File, Expand, Play, Tag } from "lucide-react";
import type { MediaFile } from "../../services/files";
import { formatBytes, getFileTypeLabel } from "../../services/files";

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

interface FileCardProps {
  file: MediaFile;
  onDelete: (id: number) => void;
  onClick: (file: MediaFile) => void;
  onTag?: (file: MediaFile) => void;
}

const typeConfig = {
  image:    { icon: ImageIcon, color: "text-purple-400", bg: "bg-purple-950/40" },
  video:    { icon: Video,     color: "text-orange-400", bg: "bg-orange-950/40" },
  audio:    { icon: Music,     color: "text-pink-400",   bg: "bg-pink-950/40"   },
  document: { icon: FileText,  color: "text-blue-400",   bg: "bg-blue-950/40"   },
  other:    { icon: File,      color: "text-zinc-400",   bg: "bg-zinc-800/40"   },
};

export function FileCard({ file, onDelete, onClick, onTag }: FileCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [imgError, setImgError] = useState(false);

  const config = typeConfig[file.file_type] ?? typeConfig.other;
  const Icon = config.icon;

  const thumbSrc = file.thumbnail_url
    ? `${BASE_URL}${file.thumbnail_url}`
    : file.file_type === "image"
      ? `${BASE_URL}${file.file_url}`
      : null;
  const showThumb = thumbSrc && !imgError;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`¿Eliminar "${file.original_name}"?`)) return;
    setDeleting(true);
    try { await onDelete(file.id); } finally { setDeleting(false); }
  };

  const imgMeta   = file.image_metadata;
  const videoMeta = file.video_metadata;
  const audioMeta = file.audio_metadata;
  const pdfMeta   = file.pdf_metadata;

  return (
    <div
      onClick={() => onClick(file)}
      className={`glass-card overflow-hidden group cursor-pointer
                  hover:border-zinc-700 transition-all duration-200
                  hover:shadow-xl hover:shadow-black/30
                  ${deleting ? "opacity-50 pointer-events-none" : ""}`}
    >
      {/* Área preview */}
      <div className="relative h-36 bg-zinc-900/80 flex items-center justify-center overflow-hidden">
        {showThumb ? (
          <img
            src={thumbSrc}
            alt={file.original_name}
            className="w-full h-full object-cover transition-transform duration-300
                       group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`w-14 h-14 rounded-2xl ${config.bg} flex items-center justify-center`}>
            <Icon size={26} className={config.color} />
          </div>
        )}

        {/* Icono play sobre el poster del video */}
        {file.file_type === "video" && showThumb && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center
                            backdrop-blur-sm group-hover:bg-black/70 transition-colors">
              <Play size={16} className="text-white ml-0.5" fill="white" />
            </div>
          </div>
        )}

        {/* Overlay acciones */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100
                        transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onClick(file); }}
            className="w-8 h-8 rounded-lg bg-zinc-800/90 flex items-center justify-center
                       text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
          >
            <Expand size={14} />
          </button>
          <a
            href={`${BASE_URL}${file.file_url}`}
            download={file.original_name}
            onClick={(e) => e.stopPropagation()}
            className="w-8 h-8 rounded-lg bg-zinc-800/90 flex items-center justify-center
                       text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
          >
            <Download size={14} />
          </a>
          {onTag && (
            <button
              onClick={(e) => { e.stopPropagation(); onTag(file); }}
              className="w-8 h-8 rounded-lg bg-zinc-800/90 flex items-center justify-center
                         text-zinc-300 hover:text-brand-300 hover:bg-zinc-700 transition-colors"
              title="Etiquetar"
            >
              <Tag size={14} />
            </button>
          )}
          <button
            onClick={handleDelete}
            className="w-8 h-8 rounded-lg bg-red-950/90 flex items-center justify-center
                       text-red-400 hover:text-red-300 hover:bg-red-900 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Badge tipo */}
        <div className="absolute top-2 left-2">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md
                           ${config.bg} ${config.color}`}>
            {getFileTypeLabel(file.file_type)}
          </span>
        </div>

        {/* Duración para videos */}
        {videoMeta && (
          <div className="absolute bottom-2 right-2">
            <span className="text-[10px] font-semibold text-white bg-black/70
                             px-1.5 py-0.5 rounded-md">
              {videoMeta.duration_str}
            </span>
          </div>
        )}

        {/* Duración para audio */}
        {audioMeta && !videoMeta && (
          <div className="absolute bottom-2 right-2">
            <span className="text-[10px] font-semibold text-white bg-black/70
                             px-1.5 py-0.5 rounded-md">
              {audioMeta.duration_str}
            </span>
          </div>
        )}

        {/* Páginas para PDF */}
        {pdfMeta && (
          <div className="absolute bottom-2 right-2">
            <span className="text-[10px] font-semibold text-white bg-black/70
                             px-1.5 py-0.5 rounded-md">
              {pdfMeta.page_count} {pdfMeta.page_count === 1 ? "pág." : "págs."}
            </span>
          </div>
        )}

        {/* Dimensiones para imágenes */}
        {imgMeta && !videoMeta && !audioMeta && !pdfMeta && (
          <div className="absolute bottom-2 right-2">
            <span className="text-[10px] text-zinc-400 bg-black/60 px-1.5 py-0.5 rounded-md">
              {imgMeta.width}×{imgMeta.height}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-2.5">
        <p className="text-xs font-medium text-zinc-300 truncate"
           title={audioMeta?.title || file.original_name}>
          {audioMeta?.title || file.original_name}
        </p>
        {audioMeta?.artist && (
          <p className="text-xs text-zinc-500 truncate mt-0.5">{audioMeta.artist}</p>
        )}
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-zinc-600">{formatBytes(file.size)}</p>
          {videoMeta ? (
            <p className="text-xs text-zinc-600">
              {videoMeta.video_codec.toUpperCase()} · {videoMeta.fps_str} fps
            </p>
          ) : audioMeta ? (
            <p className="text-xs text-zinc-600">
              {audioMeta.codec.toUpperCase()} · {audioMeta.bitrate_kbps} kbps
            </p>
          ) : pdfMeta ? (
            <p className="text-xs text-zinc-600">
              PDF · {pdfMeta.page_size_str ?? ""}
            </p>
          ) : imgMeta ? (
            <p className="text-xs text-zinc-600">{imgMeta.megapixels} MP</p>
          ) : (
            <p className="text-xs text-zinc-600">
              {new Date(file.created_at).toLocaleDateString("es-BO", { day: "2-digit", month: "short" })}
            </p>
          )}
        </div>

        {/* Tags */}
        {file.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {file.tags.slice(0, 3).map((t) => (
              <span
                key={t.id}
                className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${t.color}22`,
                  color: t.color,
                  border: `1px solid ${t.color}44`,
                }}
              >
                {t.name}
              </span>
            ))}
            {file.tags.length > 3 && (
              <span className="text-[9px] text-zinc-600 py-0.5">
                +{file.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
