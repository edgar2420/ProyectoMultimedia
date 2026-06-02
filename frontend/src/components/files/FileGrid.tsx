import { Database } from "lucide-react";
import type { MediaFile } from "../../services/files";
import { FileCard } from "./FileCard";

interface FileGridProps {
  files: MediaFile[];
  loading: boolean;
  onDelete: (id: number) => void;
  onPreview: (file: MediaFile) => void;
  onTag?: (file: MediaFile) => void;
}

export function FileGrid({ files, loading, onDelete, onPreview, onTag }: FileGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="glass-card overflow-hidden animate-pulse">
            <div className="h-36 bg-zinc-800/60" />
            <div className="px-3 py-2.5 space-y-2">
              <div className="h-3 bg-zinc-800 rounded w-3/4" />
              <div className="h-2 bg-zinc-800/60 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="glass-card p-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-950 flex items-center justify-center mb-4">
          <Database size={28} className="text-brand-400" />
        </div>
        <h3 className="text-zinc-300 font-medium mb-2">Sin archivos</h3>
        <p className="text-sm text-zinc-600 max-w-xs">
          Sube tus primeros archivos usando la zona de arrastre o el botón de selección.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          onDelete={onDelete}
          onClick={onPreview}
          onTag={onTag}
        />
      ))}
    </div>
  );
}
