import { CheckCircle, XCircle, Loader, X } from "lucide-react";
import type { UploadItem } from "../../hooks/useUpload";
import { formatBytes } from "../../services/files";

interface UploadQueueProps {
  queue: UploadItem[];
  onClearDone: () => void;
}

export function UploadQueue({ queue, onClearDone }: UploadQueueProps) {
  if (queue.length === 0) return null;

  const doneCount = queue.filter((i) => i.status === "done").length;

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50">
        <p className="text-sm font-medium text-zinc-300">
          Subiendo archivos{" "}
          <span className="text-zinc-500 font-normal">
            ({doneCount}/{queue.length})
          </span>
        </p>
        {doneCount > 0 && (
          <button
            onClick={onClearDone}
            className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
          >
            <X size={12} />
            Limpiar completados
          </button>
        )}
      </div>

      <div className="divide-y divide-zinc-800/50 max-h-60 overflow-y-auto">
        {queue.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-4 py-3">
            {/* Icono estado */}
            <div className="shrink-0">
              {item.status === "done" && <CheckCircle size={16} className="text-brand-400" />}
              {item.status === "error" && <XCircle size={16} className="text-red-400" />}
              {(item.status === "uploading" || item.status === "pending") && (
                <Loader size={16} className="text-zinc-400 animate-spin" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-300 truncate">{item.file.name}</p>
              <p className="text-xs text-zinc-600">{formatBytes(item.file.size)}</p>
              {item.error && <p className="text-xs text-red-400 mt-0.5">{item.error}</p>}
            </div>

            {/* Barra de progreso */}
            {item.status === "uploading" && (
              <div className="w-24 shrink-0">
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-600 rounded-full transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <p className="text-right text-xs text-zinc-600 mt-0.5">{item.progress}%</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
