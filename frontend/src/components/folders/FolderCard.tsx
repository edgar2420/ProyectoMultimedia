import { useState, useRef, useEffect } from "react";
import { Folder, Trash2, ChevronRight, Pencil, Check, X } from "lucide-react";
import type { Folder as FolderType } from "../../services/files";

interface FolderCardProps {
  folder: FolderType;
  onOpen: (folder: FolderType) => void;
  onDelete: (id: number) => void;
  onRename: (id: number, newName: string) => Promise<void>;
}

export function FolderCard({ folder, onOpen, onDelete, onRename }: FolderCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setEditName(folder.name);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [editing, folder.name]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`¿Eliminar la carpeta "${folder.name}" y todo su contenido?`)) return;
    setDeleting(true);
    try { await onDelete(folder.id); } finally { setDeleting(false); }
  };

  const handleRename = async () => {
    const name = editName.trim();
    if (!name || name === folder.name) { setEditing(false); return; }
    setSaving(true);
    try {
      await onRename(folder.id, name);
      setEditing(false);
    } catch {
      // revertir en error
      setEditName(folder.name);
    } finally {
      setSaving(false);
    }
  };

  const total = folder.files_count + folder.children_count;

  if (editing) {
    return (
      <div className="glass-card p-3 flex items-center gap-2 border-brand-800/40">
        <div className="w-10 h-10 rounded-xl bg-brand-950/60 flex items-center justify-center shrink-0">
          <Folder size={18} className="text-brand-400" />
        </div>
        <input
          ref={inputRef}
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRename();
            if (e.key === "Escape") setEditing(false);
          }}
          className="flex-1 bg-zinc-800 border border-brand-600/40 rounded-lg px-2 py-1
                     text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-brand-600/40"
        />
        <button
          onClick={handleRename}
          disabled={saving}
          className="w-7 h-7 flex items-center justify-center rounded-lg
                     bg-brand-600/20 text-brand-400 hover:bg-brand-600/30 transition-colors"
        >
          <Check size={13} />
        </button>
        <button
          onClick={() => setEditing(false)}
          className="w-7 h-7 flex items-center justify-center rounded-lg
                     text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          <X size={13} />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => onOpen(folder)}
      className={`glass-card p-4 cursor-pointer group hover:border-zinc-700
                  transition-all duration-200 hover:shadow-lg hover:shadow-black/20
                  flex items-center gap-3 ${deleting ? "opacity-50" : ""}`}
    >
      <div className="w-10 h-10 rounded-xl bg-brand-950/60 flex items-center
                      justify-center shrink-0 group-hover:bg-brand-950 transition-colors">
        <Folder size={20} className="text-brand-400" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-200 truncate group-hover:text-zinc-100">
          {folder.name}
        </p>
        <p className="text-xs text-zinc-600 mt-0.5">
          {folder.children_count > 0 && (
            <>{folder.children_count} carpeta{folder.children_count !== 1 ? "s" : ""}</>
          )}
          {folder.children_count > 0 && folder.files_count > 0 && " · "}
          {folder.files_count > 0 && (
            <>{folder.files_count} archivo{folder.files_count !== 1 ? "s" : ""}</>
          )}
          {total === 0 && "Vacía"}
        </p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); setEditing(true); }}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600
                     hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          title="Renombrar"
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={handleDelete}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600
                     hover:text-red-400 hover:bg-red-950/30 transition-colors"
          title="Eliminar"
        >
          <Trash2 size={13} />
        </button>
        <ChevronRight size={15} className="text-zinc-600" />
      </div>
    </div>
  );
}
