import { useState } from "react";
import { X, Download, Calendar, HardDrive, Tag, Info, ChevronRight } from "lucide-react";
import type { MediaFile } from "../../services/files";
import { formatBytes, getFileTypeLabel } from "../../services/files";
import { ImageMetadataPanel, VideoMetadataPanel, AudioMetadataPanel, PdfMetadataPanel } from "./MetadataPanel";
import { AudioPlayer } from "../audio/AudioPlayer";

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

interface FilePreviewProps {
  file: MediaFile;
  onClose: () => void;
}

export function FilePreview({ file, onClose }: FilePreviewProps) {
  const hasMeta = !!(
    file.image_metadata || file.video_metadata ||
    file.audio_metadata || file.pdf_metadata
  );
  const [showMeta, setShowMeta] = useState(
    hasMeta && file.file_type !== "audio"
  );

  const fullUrl   = `${BASE_URL}${file.file_url}`;
  const posterUrl = file.thumbnail_url ? `${BASE_URL}${file.thumbnail_url}` : undefined;

  const imgMeta   = file.image_metadata;
  const videoMeta = file.video_metadata;
  const audioMeta = file.audio_metadata;
  const pdfMeta   = file.pdf_metadata;

  const metaSummary = audioMeta
    ? `${audioMeta.duration_str} · ${audioMeta.codec.toUpperCase()} · ${audioMeta.bitrate_kbps} kbps`
    : videoMeta
      ? `${videoMeta.resolution} · ${videoMeta.duration_str} · ${videoMeta.video_codec.toUpperCase()}`
      : pdfMeta
        ? `${pdfMeta.page_count} páginas · ${pdfMeta.page_size_str ?? "PDF"}`
        : imgMeta
          ? `${imgMeta.width}×${imgMeta.height} · ${imgMeta.megapixels} MP · ${imgMeta.format}`
          : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm
                 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-5xl
                   max-h-[92vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-3.5
                        border-b border-zinc-800 shrink-0">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-zinc-200 truncate">
              {file.original_name}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              {getFileTypeLabel(file.file_type)} · {file.mime_type} · {formatBytes(file.size)}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4 shrink-0">
            {hasMeta && file.file_type !== "audio" && (
              <button
                onClick={() => setShowMeta((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                            font-medium transition-colors border ${
                              showMeta
                                ? "bg-brand-950/50 text-brand-400 border-brand-800/40"
                                : "text-zinc-400 hover:text-zinc-200 border-zinc-700/50 hover:bg-zinc-800"
                            }`}
              >
                <Info size={13} />
                {showMeta ? "Ocultar info" : "Ver info"}
              </button>
            )}
            <a
              href={fullUrl}
              download={file.original_name}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                         bg-brand-600 hover:bg-brand-800 text-white text-xs
                         font-medium transition-colors"
            >
              <Download size={13} />
              Descargar
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg
                         text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Preview principal */}
          <div className={`flex-1 min-w-0 overflow-hidden flex items-center justify-center
                           ${file.file_type === "audio" ? "bg-zinc-950/50" : "bg-zinc-950"}`}>

            {file.file_type === "image" && (
              <img
                src={fullUrl}
                alt={file.original_name}
                className="max-w-full max-h-full object-contain"
                style={{ maxHeight: "calc(92vh - 130px)" }}
              />
            )}

            {file.file_type === "video" && (
              <video
                src={fullUrl}
                poster={posterUrl}
                controls
                className="max-w-full max-h-full"
                style={{ maxHeight: "calc(92vh - 130px)" }}
              />
            )}

            {file.file_type === "audio" && (
              <div className="w-full max-w-xl px-6 py-8">
                <AudioPlayer
                  src={fullUrl}
                  title={file.original_name}
                  artist={audioMeta?.artist}
                  album={audioMeta?.album}
                  metadata={audioMeta}
                />
                {/* Panel de metadata para audio (inline, no lateral) */}
                {audioMeta && (
                  <div className="mt-6 border-t border-zinc-800 pt-5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest
                                  text-zinc-600 mb-3">
                      Información del archivo
                    </p>
                    <AudioMetadataPanel metadata={audioMeta} />
                  </div>
                )}
              </div>
            )}

            {file.file_type === "document" && (
              <div className="w-full h-full flex flex-col">
                {/* Barra de navegación PDF */}
                {pdfMeta && pdfMeta.page_count > 1 && (
                  <div className="flex items-center justify-center gap-3 py-2
                                  bg-zinc-900/80 border-b border-zinc-800 shrink-0">
                    <span className="text-xs text-zinc-500">
                      {pdfMeta.page_count} páginas
                      {pdfMeta.page_size_str ? ` · ${pdfMeta.page_size_str}` : ""}
                    </span>
                    {pdfMeta.author && (
                      <span className="text-xs text-zinc-600">
                        · Autor: {pdfMeta.author}
                      </span>
                    )}
                  </div>
                )}
                <iframe
                  src={`${fullUrl}#toolbar=1&navpanes=1&view=FitH`}
                  className="flex-1 border-0"
                  title={file.original_name}
                  style={{ minHeight: "55vh" }}
                />
              </div>
            )}

            {file.file_type === "other" && (
              <div className="flex flex-col items-center gap-3 p-12 text-zinc-500">
                <span className="text-6xl">📄</span>
                <p className="text-sm">Vista previa no disponible</p>
                <a href={fullUrl} download
                   className="text-brand-400 text-sm hover:underline">
                  Descargar para abrir
                </a>
              </div>
            )}
          </div>

          {/* ── Panel metadata lateral (imagen, video, PDF) ── */}
          {hasMeta && showMeta && file.file_type !== "audio" && (
            <div className="w-72 shrink-0 border-l border-zinc-800
                            overflow-y-auto bg-zinc-900/50">
              <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
                <Info size={13} className="text-brand-400" />
                <p className="text-xs font-semibold text-zinc-300">
                  {videoMeta
                    ? "Información de video"
                    : pdfMeta
                      ? "Información del PDF"
                      : "Información EXIF"}
                </p>
              </div>
              <div className="p-4">
                {videoMeta && <VideoMetadataPanel metadata={videoMeta} />}
                {pdfMeta && !videoMeta && <PdfMetadataPanel metadata={pdfMeta} />}
                {imgMeta && !videoMeta && !pdfMeta && <ImageMetadataPanel metadata={imgMeta} />}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-zinc-800 px-5 py-2.5 flex items-center
                        gap-6 shrink-0 bg-zinc-900/30">
          {[
            { icon: HardDrive, label: formatBytes(file.size) },
            { icon: Tag,       label: getFileTypeLabel(file.file_type) },
            { icon: Calendar,  label: new Date(file.created_at)
              .toLocaleDateString("es-BO", { dateStyle: "medium" }) },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Icon size={12} className="text-zinc-700" />
              {label}
            </div>
          ))}
          {metaSummary && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 ml-auto">
              <ChevronRight size={12} className="text-zinc-700" />
              {metaSummary}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
