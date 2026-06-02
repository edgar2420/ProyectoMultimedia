import { useState } from "react";
import { FolderInput, X, Folder, FolderOpen, ChevronRight, HardDrive } from "lucide-react";
import { Button } from "../ui/Button";
import type { FolderTreeNode, MediaFile } from "../../services/files";
import { filesService } from "../../services/files";

interface FolderPickerProps {
  tree: FolderTreeNode[];
  selected: number | null;
  onSelect: (id: number | null) => void;
  depth?: number;
}

function FolderPicker({ tree, selected, onSelect, depth = 0 }: FolderPickerProps) {
  return (
    <>
      {tree.map((node) => {
        const isSelected = selected === node.id;
        const [open, setOpen] = useState(false);
        const hasChildren = node.children.length > 0;

        return (
          <div key={node.id}>
            <div
              onClick={() => onSelect(node.id)}
              className={`flex items-center gap-2 py-1.5 px-3 rounded-lg cursor-pointer
                          text-sm transition-colors
                          ${isSelected
                            ? "bg-brand-950/50 text-brand-400"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                          }`}
              style={{ paddingLeft: `${12 + depth * 16}px` }}
            >
              {hasChildren && (
                <button
                  onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
                  className={`shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
                >
                  <ChevronRight size={12} />
                </button>
              )}
              {!hasChildren && <span className="w-3 shrink-0" />}
              {isSelected || open
                ? <FolderOpen size={14} className="shrink-0" />
                : <Folder size={14} className="shrink-0" />
              }
              <span className="truncate">{node.name}</span>
            </div>
            {open && hasChildren && (
              <FolderPicker
                tree={node.children}
                selected={selected}
                onSelect={onSelect}
                depth={depth + 1}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

interface MoveFileModalProps {
  file: MediaFile;
  tree: FolderTreeNode[];
  onClose: () => void;
  onMoved: () => void;
}

export function MoveFileModal({ file, tree, onClose, onMoved }: MoveFileModalProps) {
  const [selected, setSelected] = useState<number | null>(file.folder_id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMove = async () => {
    if (selected === file.folder_id) { onClose(); return; }
    setLoading(true);
    setError("");
    try {
      await filesService.move(file.id, selected);
      onMoved();
      onClose();
    } catch {
      setError("Error al mover el archivo. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm
                 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm
                   shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <FolderInput size={15} className="text-brand-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Mover archivo</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg
                       text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Archivo seleccionado */}
        <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-800/30">
          <p className="text-xs text-zinc-500 mb-0.5">Moviendo</p>
          <p className="text-sm font-medium text-zinc-200 truncate">{file.original_name}</p>
        </div>

        {/* Picker de destino */}
        <div className="px-2 py-3 max-h-64 overflow-y-auto">
          {/* Raíz */}
          <div
            onClick={() => setSelected(null)}
            className={`flex items-center gap-2 py-1.5 px-3 rounded-lg cursor-pointer
                        text-sm transition-colors mb-0.5
                        ${selected === null
                          ? "bg-brand-950/50 text-brand-400"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                        }`}
          >
            <HardDrive size={14} className="shrink-0" />
            <span>Mis Archivos (raíz)</span>
          </div>

          {tree.length === 0 ? (
            <p className="text-xs text-zinc-600 px-3 py-2">No hay carpetas creadas</p>
          ) : (
            <FolderPicker tree={tree} selected={selected} onSelect={setSelected} />
          )}
        </div>

        {error && (
          <p className="text-xs text-red-400 px-5 pb-2">{error}</p>
        )}

        {/* Acciones */}
        <div className="flex gap-2 px-5 py-4 border-t border-zinc-800">
          <Button variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
          <Button
            fullWidth
            loading={loading}
            disabled={selected === file.folder_id}
            onClick={handleMove}
          >
            Mover aquí
          </Button>
        </div>
      </div>
    </div>
  );
}
