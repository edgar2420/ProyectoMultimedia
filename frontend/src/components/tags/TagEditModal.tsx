import { useState } from "react";
import { Pencil, X, Check } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { TagColorPicker } from "./TagColorPicker";
import { TagBadge } from "./TagBadge";
import { tagsService } from "../../services/tags";
import type { Tag } from "../../services/tags";

interface TagEditModalProps {
  tag: Tag;
  onClose: () => void;
  onSaved: (tag: Tag) => void;
}

export function TagEditModal({ tag, onClose, onSaved }: TagEditModalProps) {
  const [name, setName]     = useState(tag.name);
  const [color, setColor]   = useState(tag.color);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const handleSave = async () => {
    setError("");
    if (!name.trim()) { setError("El nombre es obligatorio."); return; }
    setSaving(true);
    try {
      const updated = await tagsService.update(tag.id, {
        name: name.trim(),
        color,
      });
      onSaved(updated);
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })
          ?.response?.data?.detail ?? "Error al guardar";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center
                 justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xs
                   shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Pencil size={14} className="text-brand-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Editar etiqueta</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg
                       text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Formulario */}
        <div className="px-5 py-4 space-y-4">
          <Input
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") onClose(); }}
            error={error}
            autoFocus
          />
          <div>
            <p className="text-xs text-zinc-500 mb-2">Color</p>
            <TagColorPicker value={color} onChange={setColor} />
          </div>
          {name.trim() && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-600">Vista previa:</span>
              <TagBadge name={name.trim()} color={color} />
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-2 px-5 py-4 border-t border-zinc-800">
          <Button variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
          <Button fullWidth loading={saving} onClick={handleSave}>
            <Check size={13} /> Guardar
          </Button>
        </div>
      </div>
    </div>
  );
}
