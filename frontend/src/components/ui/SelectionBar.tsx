import { Trash2, X, CheckSquare } from "lucide-react";

interface SelectionBarProps {
  count: number;
  total: number;
  onSelectAll: () => void;
  onClear: () => void;
  onDeleteSelected: () => Promise<void>;
  deleting: boolean;
}

export function SelectionBar({
  count, total, onSelectAll, onClear, onDeleteSelected, deleting,
}: SelectionBarProps) {
  if (count === 0) return null;

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-brand-950/40
                    border border-brand-800/30 rounded-xl">
      <div className="flex items-center gap-3">
        <button
          onClick={onClear}
          className="w-6 h-6 flex items-center justify-center rounded text-zinc-400
                     hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
        >
          <X size={14} />
        </button>
        <span className="text-sm font-medium text-zinc-200">
          {count} seleccionado{count !== 1 ? "s" : ""}
        </span>
        {count < total && (
          <button
            onClick={onSelectAll}
            className="text-xs text-brand-400 hover:text-brand-200 flex items-center
                       gap-1 transition-colors"
          >
            <CheckSquare size={12} />
            Seleccionar todos ({total})
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onDeleteSelected}
          disabled={deleting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                     font-medium text-red-400 hover:text-red-300 bg-red-950/30
                     hover:bg-red-950/50 transition-colors disabled:opacity-50"
        >
          {deleting
            ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            : <Trash2 size={12} />
          }
          Eliminar {count}
        </button>
      </div>
    </div>
  );
}
