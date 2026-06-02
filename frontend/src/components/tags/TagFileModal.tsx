/**
 * Modal para gestionar las etiquetas de un archivo:
 * - Ver etiquetas actuales
 * - Añadir / quitar etiquetas del catálogo
 * - Crear nueva etiqueta inline
 */
import { useState } from "react";
import { Tag, X, Plus, Check } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { TagBadge } from "./TagBadge";
import { TagColorPicker } from "./TagColorPicker";
import { tagsService, TAG_COLORS } from "../../services/tags";
import type { Tag as TagType } from "../../services/tags";

interface TagFileModalProps {
  fileId: number;
  fileName: string;
  allTags: TagType[];
  currentTagIds: number[];
  onClose: () => void;
  onSaved: (tags: TagType[]) => void;
  onTagCreated: (tag: TagType) => void;
}

export function TagFileModal({
  fileId, fileName, allTags, currentTagIds,
  onClose, onSaved, onTagCreated,
}: TagFileModalProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set(currentTagIds));
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(TAG_COLORS[4]);
  const [createError, setCreateError] = useState("");

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleSave = async () => {
    setSaving(true);
    try {
      const tags = await tagsService.setFileTags(fileId, [...selected]);
      onSaved(tags);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    setCreateError("");
    if (!newName.trim()) return;
    try {
      const tag = await tagsService.create(newName.trim(), newColor);
      onTagCreated(tag);
      setSelected((prev) => new Set([...prev, tag.id]));
      setNewName("");
      setCreating(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail ?? "Error al crear la etiqueta";
      setCreateError(msg);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center
                 justify-center p-4"
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
            <Tag size={15} className="text-brand-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Etiquetas</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg
                       text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Archivo */}
        <div className="px-5 py-2.5 border-b border-zinc-800 bg-zinc-800/30">
          <p className="text-xs text-zinc-500 mb-0.5">Archivo</p>
          <p className="text-sm font-medium text-zinc-200 truncate">{fileName}</p>
        </div>

        {/* Etiquetas disponibles */}
        <div className="px-4 py-3 max-h-52 overflow-y-auto">
          {allTags.length === 0 && (
            <p className="text-xs text-zinc-600 text-center py-4">
              Aún no hay etiquetas. Crea una abajo.
            </p>
          )}
          <div className="space-y-1">
            {allTags.map((tag) => {
              const active = selected.has(tag.id);
              return (
                <div
                  key={tag.id}
                  onClick={() => toggle(tag.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer
                              transition-colors
                              ${active
                                ? "bg-zinc-800/60"
                                : "hover:bg-zinc-800/30"
                              }`}
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="flex-1 text-sm text-zinc-300 truncate">{tag.name}</span>
                  <span className="text-xs text-zinc-600">{tag.file_count}</span>
                  {active && <Check size={13} className="text-brand-400 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Crear nueva etiqueta inline */}
        <div className="border-t border-zinc-800 px-4 py-3">
          {!creating ? (
            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-1.5 text-xs text-zinc-500
                         hover:text-brand-400 transition-colors w-full"
            >
              <Plus size={13} />
              Nueva etiqueta
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Nombre de etiqueta"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                    if (e.key === "Escape") setCreating(false);
                  }}
                  error={createError}
                  className="text-xs"
                  autoFocus
                />
                <Button onClick={handleCreate} disabled={!newName.trim()}>
                  <Check size={13} />
                </Button>
              </div>
              <TagColorPicker value={newColor} onChange={setNewColor} />
              {/* Preview */}
              {newName.trim() && (
                <TagBadge name={newName.trim()} color={newColor} size="xs" />
              )}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-2 px-5 py-4 border-t border-zinc-800">
          <Button variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
          <Button fullWidth loading={saving} onClick={handleSave}>
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
}
