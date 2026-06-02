import { useState } from "react";
import { Plus, Pencil, Trash2, Hash } from "lucide-react";
import { MainLayout } from "../layouts/MainLayout";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { TagBadge } from "../components/tags/TagBadge";
import { TagColorPicker } from "../components/tags/TagColorPicker";
import { TagEditModal } from "../components/tags/TagEditModal";
import { useTags } from "../hooks/useTags";
import { TAG_COLORS } from "../services/tags";
import type { Tag } from "../services/tags";

export function TagsPage() {
  const { tags, loading, create, remove, update } = useTags();

  const [creating, setCreating]     = useState(false);
  const [newName, setNewName]       = useState("");
  const [newColor, setNewColor]     = useState(TAG_COLORS[4]);
  const [createError, setCreateError] = useState("");
  const [creating2, setCreating2]   = useState(false);
  const [editTag, setEditTag]       = useState<Tag | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleCreate = async () => {
    setCreateError("");
    if (!newName.trim()) return;
    setCreating2(true);
    try {
      await create(newName.trim(), newColor);
      setNewName("");
      setCreating(false);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })
          ?.response?.data?.detail ?? "Error al crear la etiqueta";
      setCreateError(msg);
    } finally {
      setCreating2(false);
    }
  };

  const handleDelete = async (tag: Tag) => {
    if (!confirm(`¿Eliminar "${tag.name}"?\nSe quitará de todos los archivos.`)) return;
    setDeletingId(tag.id);
    try { await remove(tag.id); } finally { setDeletingId(null); }
  };

  return (
    <MainLayout title="Etiquetas">
      <div className="max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-zinc-100">Mis etiquetas</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {loading ? "cargando..." : `${tags.length} etiqueta${tags.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          {!creating && (
            <Button onClick={() => { setCreating(true); setCreateError(""); setNewName(""); }}>
              <Plus size={14} /> Nueva etiqueta
            </Button>
          )}
        </div>

        {/* Formulario crear */}
        {creating && (
          <div className="glass-card p-5 mb-4 space-y-3">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Nueva etiqueta
            </p>
            <Input
              placeholder="Nombre de la etiqueta"
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setCreateError(""); }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") setCreating(false);
              }}
              error={createError}
              autoFocus
            />
            <div>
              <p className="text-xs text-zinc-500 mb-2">Color</p>
              <TagColorPicker value={newColor} onChange={setNewColor} />
            </div>
            {newName.trim() && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-600">Vista previa:</span>
                <TagBadge name={newName.trim()} color={newColor} />
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <Button variant="ghost" onClick={() => setCreating(false)}>Cancelar</Button>
              <Button onClick={handleCreate} loading={creating2} disabled={!newName.trim()}>
                Crear etiqueta
              </Button>
            </div>
          </div>
        )}

        {/* Lista de tags */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-zinc-900/60 animate-pulse" />
            ))}
          </div>
        ) : tags.length === 0 ? (
          <div className="glass-card p-16 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-950 flex items-center
                            justify-center mb-3">
              <Hash size={24} className="text-brand-400" />
            </div>
            <p className="text-zinc-300 font-medium mb-1">Sin etiquetas</p>
            <p className="text-xs text-zinc-600 max-w-xs">
              Crea una etiqueta para organizar y filtrar tus archivos rápidamente.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className={`glass-card px-4 py-3 flex items-center gap-3 group
                            transition-opacity ${deletingId === tag.id ? "opacity-40 pointer-events-none" : ""}`}
              >
                {/* Punto de color */}
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: tag.color }}
                />

                {/* Nombre */}
                <span className="flex-1 text-sm text-zinc-200 font-medium truncate">
                  {tag.name}
                </span>

                {/* Conteo */}
                <span className="text-xs text-zinc-600 shrink-0 mr-1">
                  {tag.file_count} archivo{tag.file_count !== 1 ? "s" : ""}
                </span>

                {/* Badge preview */}
                <TagBadge name={tag.name} color={tag.color} size="xs" />

                {/* Acciones */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0">
                  <button
                    onClick={() => setEditTag(tag)}
                    title="Editar"
                    className="w-7 h-7 flex items-center justify-center rounded-lg
                               text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(tag)}
                    title="Eliminar"
                    className="w-7 h-7 flex items-center justify-center rounded-lg
                               text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal editar */}
      {editTag && (
        <TagEditModal
          tag={editTag}
          onClose={() => setEditTag(null)}
          onSaved={(updated) => {
            update(updated.id, { name: updated.name, color: updated.color });
            setEditTag(null);
          }}
        />
      )}
    </MainLayout>
  );
}
