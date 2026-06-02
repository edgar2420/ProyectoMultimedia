import { useState, useRef, useEffect } from "react";
import { FolderPlus, X } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface CreateFolderModalProps {
  onConfirm: (name: string) => Promise<unknown>;
  onClose: () => void;
}

export function CreateFolderModal({ onConfirm, onClose }: CreateFolderModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onConfirm(name.trim());
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail ?? "Error al crear la carpeta";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <FolderPlus size={16} className="text-brand-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Nueva carpeta</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500
                       hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <p className="text-xs text-red-400 bg-red-950/30 border border-red-900/40
                          rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <Input
            ref={inputRef}
            label="Nombre de la carpeta"
            placeholder="Mi carpeta"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
          />
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose} fullWidth>
              Cancelar
            </Button>
            <Button type="submit" loading={loading} disabled={!name.trim()} fullWidth>
              Crear
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
