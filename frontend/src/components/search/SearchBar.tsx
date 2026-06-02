/**
 * SearchBar global — aparece en el Navbar.
 * Muestra hasta 6 resultados instantáneos con debounce de 250ms.
 * Clic en resultado → navega al archivo.
 * Enter / clic "Ver todos" → navega a /search?q=…
 */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ImageIcon, Video, Music, FileText, File, Loader, X } from "lucide-react";
import { useQuickSearch } from "../../hooks/useSearch";
import { formatBytes } from "../../services/files";
import type { MediaFile } from "../../services/files";

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

const typeIcons: Record<string, React.ReactNode> = {
  image:    <ImageIcon size={13} className="text-purple-400" />,
  video:    <Video     size={13} className="text-orange-400" />,
  audio:    <Music     size={13} className="text-pink-400"   />,
  document: <FileText  size={13} className="text-blue-400"   />,
  other:    <File      size={13} className="text-zinc-400"   />,
};

interface SearchBarProps {
  onFileSelect?: (file: MediaFile) => void;
}

export function SearchBar({ onFileSelect }: SearchBarProps) {
  const [query, setQuery]     = useState("");
  const [open, setOpen]       = useState(false);
  const containerRef          = useRef<HTMLDivElement>(null);
  const inputRef              = useRef<HTMLInputElement>(null);
  const navigate              = useNavigate();
  const { results, loading }  = useQuickSearch(query);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
    if (e.key === "Escape") {
      setQuery("");
      setOpen(false);
    }
  };

  const handleSelect = (file: MediaFile) => {
    setOpen(false);
    setQuery("");
    onFileSelect?.(file);
  };

  const showDropdown = open && query.length >= 2;

  return (
    <div ref={containerRef} className="relative">
      {/* Input */}
      <div className="relative flex items-center">
        <Search size={14} className="absolute left-3 text-zinc-500 pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar archivos, artistas, títulos…"
          className="w-64 bg-zinc-800/60 border border-zinc-700/50 rounded-xl
                     pl-9 pr-8 py-2 text-sm text-zinc-300 placeholder:text-zinc-600
                     outline-none focus:border-brand-600/50 focus:ring-1
                     focus:ring-brand-600/20 transition-all"
        />
        {loading && (
          <Loader size={13} className="absolute right-3 text-zinc-500 animate-spin" />
        )}
        {query && !loading && (
          <button
            onClick={() => { setQuery(""); setOpen(false); inputRef.current?.focus(); }}
            className="absolute right-3 text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Dropdown de resultados instantáneos */}
      {showDropdown && results && (
        <div className="absolute top-full mt-2 left-0 w-80 bg-zinc-900 border border-zinc-800
                        rounded-2xl shadow-2xl z-50 overflow-hidden">
          {results.results.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-zinc-500">Sin resultados para "{query}"</p>
              <p className="text-xs text-zinc-600 mt-1">
                Prueba con otro término o usa la búsqueda avanzada
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
                <p className="text-xs text-zinc-600">
                  {results.total} resultado{results.total !== 1 ? "s" : ""} · {results.took_ms}ms
                </p>
                <button
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
                    setOpen(false);
                  }}
                  className="text-xs text-brand-400 hover:text-brand-200 transition-colors"
                >
                  Ver todos →
                </button>
              </div>

              {/* Resultados */}
              {results.results.map((file) => {
                const thumbSrc = file.thumbnail_url
                  ? `${BASE_URL}${file.thumbnail_url}`
                  : file.file_type === "image"
                    ? `${BASE_URL}${file.file_url}`
                    : null;

                // Construir subtítulo informativo
                const sub = file.audio_metadata?.artist
                  ? `${file.audio_metadata.artist} — ${file.audio_metadata.album ?? ""}`
                  : file.pdf_metadata?.author
                    ? `Autor: ${file.pdf_metadata.author}`
                    : file.image_metadata
                      ? `${file.image_metadata.width}×${file.image_metadata.height}px`
                      : formatBytes(file.size);

                return (
                  <div
                    key={file.id}
                    onClick={() => handleSelect(file)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50
                               cursor-pointer transition-colors border-b border-zinc-800/30
                               last:border-0"
                  >
                    {/* Thumbnail o icono */}
                    {thumbSrc ? (
                      <img
                        src={thumbSrc}
                        alt=""
                        className="w-9 h-9 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center
                                      justify-center shrink-0">
                        {typeIcons[file.file_type] ?? typeIcons.other}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate">
                        {file.audio_metadata?.title || file.original_name}
                      </p>
                      <p className="text-xs text-zinc-600 truncate">{sub}</p>
                    </div>

                    {/* Tags */}
                    {file.tags.length > 0 && (
                      <div className="shrink-0 flex gap-1">
                        {file.tags.slice(0, 2).map((t) => (
                          <span
                            key={t.id}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: t.color }}
                            title={t.name}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Footer "Ver todos" si hay más */}
              {results.total > results.results.length && (
                <button
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
                    setOpen(false);
                  }}
                  className="w-full px-4 py-3 text-xs text-brand-400 hover:text-brand-200
                             hover:bg-zinc-800/30 transition-colors border-t border-zinc-800
                             text-center"
                >
                  Ver los {results.total} resultados completos →
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
