import { useState, useRef, useCallback } from "react";
import { UploadCloud, FolderOpen } from "lucide-react";

const ACCEPTED = [
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "video/mp4", "video/quicktime", "video/webm",
  "audio/mpeg", "audio/wav", "audio/ogg",
  "application/pdf",
].join(",");

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

export function DropZone({ onFiles, disabled }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = useCallback((files: FileList | null) => {
    if (!files || disabled) return;
    onFiles(Array.from(files));
  }, [onFiles, disabled]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handle(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`
        relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-4
        transition-all duration-200 cursor-pointer select-none
        ${dragging
          ? "border-brand-400 bg-brand-950/30 scale-[1.01]"
          : "border-zinc-700/60 hover:border-zinc-600 bg-zinc-900/30 hover:bg-zinc-900/50"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => handle(e.target.files)}
      />

      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors
        ${dragging ? "bg-brand-600/20" : "bg-zinc-800"}`}
      >
        <UploadCloud
          size={28}
          className={`transition-colors ${dragging ? "text-brand-400" : "text-zinc-500"}`}
        />
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-zinc-300">
          {dragging ? "Suelta los archivos aquí" : "Arrastra archivos o haz clic para seleccionar"}
        </p>
        <p className="text-xs text-zinc-600 mt-1">
          Imágenes, videos, audio, PDF — máx. 100 MB por archivo
        </p>
      </div>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-800
                   text-white text-sm font-medium transition-colors"
      >
        <FolderOpen size={15} />
        Seleccionar archivos
      </button>
    </div>
  );
}
