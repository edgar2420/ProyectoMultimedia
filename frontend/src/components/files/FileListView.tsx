import { useState } from "react";
import {
  ImageIcon, Video, Music, FileText, File,
  Trash2, Download, FolderInput, ArrowUpDown, Tag,
} from "lucide-react";
import type { MediaFile } from "../../services/files";
import { formatBytes, getFileTypeLabel } from "../../services/files";

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

const typeIcons = {
  image:    { icon: ImageIcon, color: "text-purple-400" },
  video:    { icon: Video,     color: "text-orange-400" },
  audio:    { icon: Music,     color: "text-pink-400"   },
  document: { icon: FileText,  color: "text-blue-400"   },
  other:    { icon: File,      color: "text-zinc-400"   },
};

interface FileListViewProps {
  files: MediaFile[];
  loading: boolean;
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onPreview: (file: MediaFile) => void;
  onMove: (file: MediaFile) => void;
  onTag?: (file: MediaFile) => void;
}

function SubInfo({ file }: { file: MediaFile }) {
  if (file.video_metadata) return <>{file.video_metadata.duration_str} · {file.video_metadata.video_codec.toUpperCase()}</>;
  if (file.audio_metadata) return <>{file.audio_metadata.duration_str} · {file.audio_metadata.codec.toUpperCase()}</>;
  if (file.image_metadata) return <>{file.image_metadata.width}×{file.image_metadata.height} · {file.image_metadata.megapixels} MP</>;
  if (file.pdf_metadata)   return <>{file.pdf_metadata.page_count} págs. · {file.pdf_metadata.page_size_str ?? "PDF"}</>;
  return <>{file.mime_type}</>;
}

export function FileListView({
  files, loading, selectedIds, onToggleSelect,
  onDelete, onPreview, onMove, onTag,
}: FileListViewProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);

  if (loading) return (
    <div className="space-y-1">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-12 bg-zinc-800/40 rounded-lg animate-pulse" />
      ))}
    </div>
  );

  if (files.length === 0) return (
    <div className="glass-card p-12 text-center">
      <p className="text-zinc-500 text-sm">No hay archivos en esta ubicación</p>
    </div>
  );

  return (
    <div className="glass-card overflow-hidden">
      {/* Cabecera */}
      <div className="grid grid-cols-[auto_1fr_120px_100px_100px_80px] items-center
                      gap-3 px-4 py-2 border-b border-zinc-800/50 text-[10px]
                      font-semibold uppercase tracking-wide text-zinc-600">
        <input type="checkbox" className="opacity-0 w-4 h-4" readOnly />
        <span className="flex items-center gap-1 cursor-pointer">
          <ArrowUpDown size={9} /> Nombre
        </span>
        <span>Tipo</span>
        <span>Tamaño</span>
        <span>Fecha</span>
        <span />
      </div>

      {/* Filas */}
      {files.map((file) => {
        const cfg = typeIcons[file.file_type] ?? typeIcons.other;
        const Icon = cfg.icon;
        const thumbSrc = file.thumbnail_url
          ? `${BASE_URL}${file.thumbnail_url}`
          : null;
        const isSelected = selectedIds.has(file.id);

        return (
          <div
            key={file.id}
            className={`grid grid-cols-[auto_1fr_120px_100px_100px_80px] items-center
                        gap-3 px-4 py-2.5 border-b border-zinc-800/30 last:border-0
                        transition-colors cursor-pointer group
                        ${isSelected ? "bg-brand-950/20" : "hover:bg-zinc-800/30"}`}
            onClick={() => onPreview(file)}
          >
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onClick={(e) => e.stopPropagation()}
              onChange={() => onToggleSelect(file.id)}
              className="w-4 h-4 accent-brand-400 cursor-pointer"
            />

            {/* Nombre + icono/thumbnail */}
            <div className="flex items-center gap-2.5 min-w-0">
              {thumbSrc ? (
                <img
                  src={thumbSrc}
                  alt=""
                  className="w-8 h-8 rounded object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded bg-zinc-800 flex items-center
                                justify-center shrink-0">
                  <Icon size={14} className={cfg.color} />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium text-zinc-200 truncate">
                  {file.original_name}
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-[10px] text-zinc-600 truncate">
                    <SubInfo file={file} />
                  </p>
                  {file.tags.slice(0, 2).map((t) => (
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
                  {file.tags.length > 2 && (
                    <span className="text-[9px] text-zinc-600">+{file.tags.length - 2}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Tipo */}
            <span className={`text-xs font-medium ${cfg.color}`}>
              {getFileTypeLabel(file.file_type)}
            </span>

            {/* Tamaño */}
            <span className="text-xs text-zinc-500">{formatBytes(file.size)}</span>

            {/* Fecha */}
            <span className="text-xs text-zinc-600">
              {new Date(file.created_at).toLocaleDateString("es-BO", {
                day: "2-digit", month: "short", year: "numeric",
              })}
            </span>

            {/* Acciones */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100
                            transition-opacity justify-end">
              {onTag && (
                <button
                  title="Etiquetar"
                  onClick={(e) => { e.stopPropagation(); onTag(file); }}
                  className="w-6 h-6 flex items-center justify-center rounded
                             text-zinc-600 hover:text-brand-400 hover:bg-zinc-700 transition-colors"
                >
                  <Tag size={12} />
                </button>
              )}
              <button
                title="Mover"
                onClick={(e) => { e.stopPropagation(); onMove(file); }}
                className="w-6 h-6 flex items-center justify-center rounded
                           text-zinc-600 hover:text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                <FolderInput size={12} />
              </button>
              <a
                href={`${BASE_URL}${file.file_url}`}
                download={file.original_name}
                onClick={(e) => e.stopPropagation()}
                className="w-6 h-6 flex items-center justify-center rounded
                           text-zinc-600 hover:text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                <Download size={12} />
              </a>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!confirm(`¿Eliminar "${file.original_name}"?`)) return;
                  setDeleteId(file.id);
                  try { await onDelete(file.id); } finally { setDeleteId(null); }
                }}
                disabled={deleteId === file.id}
                className="w-6 h-6 flex items-center justify-center rounded
                           text-zinc-600 hover:text-red-400 hover:bg-red-950/30 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
