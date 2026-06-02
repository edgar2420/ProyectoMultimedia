import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search, Filter, X, ImageIcon, Video, Music,
  FileText, File, ChevronDown, ChevronUp, SlidersHorizontal,
  Camera, Clock, Hash,
} from "lucide-react";
import { MainLayout } from "../layouts/MainLayout";
import { FilePreview } from "../components/files/FilePreview";
import { TagBadge } from "../components/tags/TagBadge";
import { useSearch } from "../hooks/useSearch";
import { useTags } from "../hooks/useTags";
import { formatBytes, getFileTypeLabel } from "../services/files";
import type { MediaFile } from "../services/files";

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

const FILE_TYPES = [
  { value: "image",    label: "Imágenes",   icon: <ImageIcon size={13} className="text-purple-400" /> },
  { value: "video",    label: "Videos",     icon: <Video     size={13} className="text-orange-400" /> },
  { value: "audio",    label: "Audio",      icon: <Music     size={13} className="text-pink-400"   /> },
  { value: "document", label: "Documentos", icon: <FileText  size={13} className="text-blue-400"   /> },
  { value: "other",    label: "Otros",      icon: <File      size={13} className="text-zinc-400"   /> },
];

const SIZE_PRESETS = [
  { label: "Menos de 1 MB",   min: 0,          max: 1048576    },
  { label: "1 MB – 10 MB",    min: 1048576,    max: 10485760   },
  { label: "10 MB – 50 MB",   min: 10485760,   max: 52428800   },
  { label: "Más de 50 MB",    min: 52428800,   max: undefined  },
];

const typeIcons: Record<string, React.ReactNode> = {
  image:    <ImageIcon size={16} className="text-purple-400" />,
  video:    <Video     size={16} className="text-orange-400" />,
  audio:    <Music     size={16} className="text-pink-400"   />,
  document: <FileText  size={16} className="text-blue-400"   />,
  other:    <File      size={16} className="text-zinc-400"   />,
};

export function SearchPage() {
  const [searchParams] = useSearchParams();

  // Estado de filtros generales
  const [query, setQuery]           = useState(searchParams.get("q") ?? "");
  const [types, setTypes]           = useState<string[]>([]);
  const [tagIds, setTagIds]         = useState<number[]>([]);
  const [dateFrom, setDateFrom]     = useState("");
  const [dateTo, setDateTo]         = useState("");
  const [sizePreset, setSizePreset] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [preview, setPreview]       = useState<MediaFile | null>(null);
  const [page, setPage]             = useState(0);
  const LIMIT = 24;

  // Filtros imagen
  const [minWidth, setMinWidth]       = useState("");
  const [maxWidth, setMaxWidth]       = useState("");
  const [minHeight, setMinHeight]     = useState("");
  const [maxHeight, setMaxHeight]     = useState("");
  const [cameraMake, setCameraMake]   = useState("");
  const [hasExif, setHasExif]         = useState(false);

  // Filtros video
  const [minDuration, setMinDuration] = useState("");
  const [maxDuration, setMaxDuration] = useState("");
  const [videoCodec, setVideoCodec]   = useState("");
  const [minFps, setMinFps]           = useState("");
  const [hasAudio, setHasAudio]       = useState(false);
  const [minVideoWidth, setMinVideoWidth] = useState("");

  // Filtros audio
  const [artist, setArtist]           = useState("");
  const [album, setAlbum]             = useState("");
  const [genre, setGenre]             = useState("");
  const [minAudioDur, setMinAudioDur] = useState("");
  const [maxAudioDur, setMaxAudioDur] = useState("");

  // Filtros pdf
  const [minPages, setMinPages]       = useState("");
  const [maxPages, setMaxPages]       = useState("");
  const [pdfAuthor, setPdfAuthor]     = useState("");
  const [pdfTitle, setPdfTitle]       = useState("");

  const { tags } = useTags();

  // Helpers para convertir strings a números opcionales
  const n = (v: string) => v !== "" ? Number(v) : undefined;

  const minSize = sizePreset != null ? SIZE_PRESETS[sizePreset].min : undefined;
  const maxSize = sizePreset != null ? SIZE_PRESETS[sizePreset].max : undefined;

  const onlyType = types.length === 1 ? types[0] : undefined;

  const { data, loading } = useSearch({
    q: query,
    type: types.length ? types : undefined,
    tag_id: tagIds.length ? tagIds : undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    min_size: minSize,
    max_size: maxSize,
    limit: LIMIT,
    offset: page * LIMIT,
    // imagen (solo si hay tipo imagen seleccionado o sin tipo)
    ...((!onlyType || onlyType === "image") && {
      min_width:   n(minWidth),
      max_width:   n(maxWidth),
      min_height:  n(minHeight),
      max_height:  n(maxHeight),
      camera_make: cameraMake || undefined,
      has_exif:    hasExif || undefined,
    }),
    // video
    ...((!onlyType || onlyType === "video") && {
      min_duration:    n(minDuration),
      max_duration:    n(maxDuration),
      video_codec:     videoCodec || undefined,
      min_fps:         n(minFps),
      has_audio:       hasAudio || undefined,
      min_video_width: n(minVideoWidth),
    }),
    // audio
    ...((!onlyType || onlyType === "audio") && {
      min_audio_duration: n(minAudioDur),
      max_audio_duration: n(maxAudioDur),
      artist: artist || undefined,
      album:  album  || undefined,
      genre:  genre  || undefined,
    }),
    // pdf
    ...((!onlyType || onlyType === "document") && {
      min_pages:  n(minPages),
      max_pages:  n(maxPages),
      pdf_author: pdfAuthor || undefined,
      pdf_title:  pdfTitle  || undefined,
    }),
  });

  // Sincronizar query con URL param al montar
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, []);

  const toggleType = (t: string) =>
    setTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const toggleTag = (id: number) =>
    setTagIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const clearAll = () => {
    setTypes([]); setTagIds([]); setDateFrom(""); setDateTo("");
    setSizePreset(null); setPage(0);
    setMinWidth(""); setMaxWidth(""); setMinHeight(""); setMaxHeight("");
    setCameraMake(""); setHasExif(false);
    setMinDuration(""); setMaxDuration(""); setVideoCodec("");
    setMinFps(""); setHasAudio(false); setMinVideoWidth("");
    setArtist(""); setAlbum(""); setGenre("");
    setMinAudioDur(""); setMaxAudioDur("");
    setMinPages(""); setMaxPages(""); setPdfAuthor(""); setPdfTitle("");
  };

  const filterInputCls = "bg-zinc-800/60 border border-zinc-700/50 rounded-lg px-3 py-1.5 " +
    "text-xs text-zinc-300 placeholder:text-zinc-600 outline-none " +
    "focus:border-brand-600/40 transition-colors w-full";

  const metaActive =
    minWidth || maxWidth || minHeight || maxHeight || cameraMake || hasExif ||
    minDuration || maxDuration || videoCodec || minFps || hasAudio || minVideoWidth ||
    artist || album || genre || minAudioDur || maxAudioDur ||
    minPages || maxPages || pdfAuthor || pdfTitle;

  const hasFilters = types.length || tagIds.length || dateFrom || dateTo ||
    sizePreset != null || !!metaActive;
  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0;

  return (
    <MainLayout title="Búsqueda Avanzada">
      <div className="max-w-5xl mx-auto">

        {/* Barra de búsqueda principal */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-zinc-100 mb-4">Búsqueda Avanzada</h2>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(0); }}
                placeholder="Buscar por nombre, artista, título, autor, cámara…"
                className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-xl
                           pl-11 pr-4 py-3 text-zinc-200 placeholder:text-zinc-600
                           outline-none focus:border-brand-600/50 focus:ring-2
                           focus:ring-brand-600/20 transition-all text-sm"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); setPage(0); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600
                             hover:text-zinc-300 transition-colors"
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border
                          text-sm font-medium transition-all ${
                hasFilters
                  ? "bg-brand-950/50 text-brand-400 border-brand-800/40"
                  : "bg-zinc-900/60 text-zinc-400 border-zinc-700/50 hover:text-zinc-200"
              }`}
            >
              <SlidersHorizontal size={15} />
              Filtros
              {hasFilters && (
                <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px]
                                 flex items-center justify-center font-bold">
                  {[types.length > 0, tagIds.length > 0, !!dateFrom || !!dateTo, sizePreset != null]
                    .filter(Boolean).length}
                </span>
              )}
              {showFilters ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>
        </div>

        {/* Chips de filtros activos */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-4 -mt-2">
            <span className="text-[10px] text-zinc-600 uppercase tracking-wide shrink-0">Activos:</span>
            {types.map((t) => (
              <button key={t} onClick={() => setTypes((p) => p.filter((x) => x !== t))}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                           bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 transition-colors">
                {t} <X size={10} />
              </button>
            ))}
            {tagIds.map((id) => {
              const tag = tags.find((t) => t.id === id);
              return tag ? (
                <button key={id} onClick={() => setTagIds((p) => p.filter((x) => x !== id))}
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border transition-colors"
                  style={{ backgroundColor: `${tag.color}22`, color: tag.color, borderColor: `${tag.color}44` }}>
                  {tag.name} <X size={10} />
                </button>
              ) : null;
            })}
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(""); setDateTo(""); }}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-zinc-800
                           text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-colors">
                {dateFrom || "…"} → {dateTo || "…"} <X size={10} />
              </button>
            )}
            {sizePreset != null && (
              <button onClick={() => setSizePreset(null)}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-zinc-800
                           text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-colors">
                {SIZE_PRESETS[sizePreset].label} <X size={10} />
              </button>
            )}
            {artist && (
              <button onClick={() => setArtist("")}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-zinc-800
                           text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-colors">
                Artista: {artist} <X size={10} />
              </button>
            )}
            {cameraMake && (
              <button onClick={() => setCameraMake("")}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-zinc-800
                           text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-colors">
                Cámara: {cameraMake} <X size={10} />
              </button>
            )}
            {(minWidth || maxWidth) && (
              <button onClick={() => { setMinWidth(""); setMaxWidth(""); }}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-zinc-800
                           text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-colors">
                Ancho: {minWidth||"0"}–{maxWidth||"∞"}px <X size={10} />
              </button>
            )}
            {(minDuration || maxDuration) && (
              <button onClick={() => { setMinDuration(""); setMaxDuration(""); }}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-zinc-800
                           text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-colors">
                Duración: {minDuration||"0"}–{maxDuration||"∞"}s <X size={10} />
              </button>
            )}
            {(minPages || maxPages) && (
              <button onClick={() => { setMinPages(""); setMaxPages(""); }}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-zinc-800
                           text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-colors">
                Páginas: {minPages||"0"}–{maxPages||"∞"} <X size={10} />
              </button>
            )}
            <button onClick={clearAll}
              className="text-xs text-zinc-600 hover:text-brand-400 transition-colors ml-1">
              Limpiar todo
            </button>
          </div>
        )}

        {/* Panel de filtros avanzados */}
        {showFilters && (
          <div className="glass-card p-5 mb-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <Filter size={14} className="text-brand-400" />
                Filtros avanzados
              </h3>
              {hasFilters && (
                <button
                  onClick={clearAll}
                  className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
                >
                  Limpiar todos
                </button>
              )}
            </div>

            {/* Tipo de archivo */}
            <div>
              <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wide mb-2">
                Tipo de archivo
              </p>
              <div className="flex flex-wrap gap-2">
                {FILE_TYPES.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    onClick={() => toggleType(value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                                font-medium border transition-all ${
                      types.includes(value)
                        ? "bg-zinc-700 text-zinc-100 border-zinc-600"
                        : "bg-zinc-800/30 text-zinc-500 border-zinc-700/40 hover:text-zinc-300"
                    }`}
                  >
                    {icon}{label}
                  </button>
                ))}
              </div>
            </div>

            {/* Etiquetas */}
            {tags.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wide mb-2">
                  Etiquetas
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <TagBadge
                      key={tag.id}
                      name={tag.name}
                      color={tag.color}
                      clickable
                      selected={tagIds.includes(tag.id)}
                      onClick={() => toggleTag(tag.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Fecha */}
            <div>
              <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wide mb-2">
                Rango de fecha
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
                  className="bg-zinc-800/60 border border-zinc-700/50 rounded-lg px-3 py-1.5
                             text-sm text-zinc-300 outline-none focus:border-brand-600/40
                             transition-colors"
                />
                <span className="text-zinc-600 text-xs">hasta</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
                  className="bg-zinc-800/60 border border-zinc-700/50 rounded-lg px-3 py-1.5
                             text-sm text-zinc-300 outline-none focus:border-brand-600/40
                             transition-colors"
                />
                {(dateFrom || dateTo) && (
                  <button
                    onClick={() => { setDateFrom(""); setDateTo(""); }}
                    className="text-zinc-600 hover:text-zinc-300 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Tamaño */}
            <div>
              <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wide mb-2">
                Tamaño
              </p>
              <div className="flex flex-wrap gap-2">
                {SIZE_PRESETS.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => { setSizePreset(sizePreset === i ? null : i); setPage(0); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      sizePreset === i
                        ? "bg-zinc-700 text-zinc-100 border-zinc-600"
                        : "bg-zinc-800/30 text-zinc-500 border-zinc-700/40 hover:text-zinc-300"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Filtros Imagen ──────────────────────────────────── */}
            {(!types.length || types.includes("image")) && (
              <div>
                <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wide mb-2
                              flex items-center gap-1.5">
                  <Camera size={11} /> Imagen
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: "Ancho mín. (px)", val: minWidth, set: setMinWidth },
                    { label: "Ancho máx. (px)", val: maxWidth, set: setMaxWidth },
                    { label: "Alto mín. (px)",  val: minHeight, set: setMinHeight },
                    { label: "Alto máx. (px)",  val: maxHeight, set: setMaxHeight },
                  ].map(({ label, val, set }) => (
                    <input key={label} type="number" placeholder={label} value={val}
                      onChange={(e) => { set(e.target.value); setPage(0); }}
                      className={filterInputCls} />
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <input type="text" placeholder="Marca cámara (ej: Canon)"
                    value={cameraMake} onChange={(e) => { setCameraMake(e.target.value); setPage(0); }}
                    className={`${filterInputCls} flex-1`} />
                  <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer shrink-0">
                    <input type="checkbox" checked={hasExif}
                      onChange={(e) => { setHasExif(e.target.checked); setPage(0); }}
                      className="w-3.5 h-3.5 accent-brand-400" />
                    Solo con EXIF
                  </label>
                </div>
              </div>
            )}

            {/* ── Filtros Video ───────────────────────────────────── */}
            {(!types.length || types.includes("video")) && (
              <div>
                <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wide mb-2
                              flex items-center gap-1.5">
                  <Clock size={11} /> Video
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <input type="number" placeholder="Duración mín. (seg)" value={minDuration}
                    onChange={(e) => { setMinDuration(e.target.value); setPage(0); }}
                    className={filterInputCls} />
                  <input type="number" placeholder="Duración máx. (seg)" value={maxDuration}
                    onChange={(e) => { setMaxDuration(e.target.value); setPage(0); }}
                    className={filterInputCls} />
                  <input type="text" placeholder="Codec (ej: h264)" value={videoCodec}
                    onChange={(e) => { setVideoCodec(e.target.value); setPage(0); }}
                    className={filterInputCls} />
                  <input type="number" placeholder="FPS mínimo" value={minFps}
                    onChange={(e) => { setMinFps(e.target.value); setPage(0); }}
                    className={filterInputCls} />
                  <input type="number" placeholder="Resolución mín. (px ancho)" value={minVideoWidth}
                    onChange={(e) => { setMinVideoWidth(e.target.value); setPage(0); }}
                    className={filterInputCls} />
                  <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer">
                    <input type="checkbox" checked={hasAudio}
                      onChange={(e) => { setHasAudio(e.target.checked); setPage(0); }}
                      className="w-3.5 h-3.5 accent-brand-400" />
                    Solo con audio
                  </label>
                </div>
              </div>
            )}

            {/* ── Filtros Audio ───────────────────────────────────── */}
            {(!types.length || types.includes("audio")) && (
              <div>
                <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wide mb-2
                              flex items-center gap-1.5">
                  <Hash size={11} /> Audio
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <input type="text" placeholder="Artista" value={artist}
                    onChange={(e) => { setArtist(e.target.value); setPage(0); }}
                    className={filterInputCls} />
                  <input type="text" placeholder="Álbum" value={album}
                    onChange={(e) => { setAlbum(e.target.value); setPage(0); }}
                    className={filterInputCls} />
                  <input type="text" placeholder="Género" value={genre}
                    onChange={(e) => { setGenre(e.target.value); setPage(0); }}
                    className={filterInputCls} />
                  <input type="number" placeholder="Duración mín. (seg)" value={minAudioDur}
                    onChange={(e) => { setMinAudioDur(e.target.value); setPage(0); }}
                    className={filterInputCls} />
                  <input type="number" placeholder="Duración máx. (seg)" value={maxAudioDur}
                    onChange={(e) => { setMaxAudioDur(e.target.value); setPage(0); }}
                    className={filterInputCls} />
                </div>
              </div>
            )}

            {/* ── Filtros PDF ─────────────────────────────────────── */}
            {(!types.length || types.includes("document")) && (
              <div>
                <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wide mb-2
                              flex items-center gap-1.5">
                  <FileText size={11} /> PDF / Documento
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input type="number" placeholder="Páginas mín." value={minPages}
                    onChange={(e) => { setMinPages(e.target.value); setPage(0); }}
                    className={filterInputCls} />
                  <input type="number" placeholder="Páginas máx." value={maxPages}
                    onChange={(e) => { setMaxPages(e.target.value); setPage(0); }}
                    className={filterInputCls} />
                  <input type="text" placeholder="Autor" value={pdfAuthor}
                    onChange={(e) => { setPdfAuthor(e.target.value); setPage(0); }}
                    className={filterInputCls} />
                  <input type="text" placeholder="Título" value={pdfTitle}
                    onChange={(e) => { setPdfTitle(e.target.value); setPage(0); }}
                    className={filterInputCls} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Resultados */}
        <div>
          {/* Header de resultados */}
          {data && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-zinc-400">
                {data.total === 0
                  ? "Sin resultados"
                  : <>
                      <span className="font-semibold text-zinc-200">{data.total}</span>
                      {" "}resultado{data.total !== 1 ? "s" : ""}
                      {query && <> para "<span className="text-brand-400">{query}</span>"</>}
                      <span className="text-zinc-600 text-xs ml-2">· {data.took_ms}ms</span>
                    </>
                }
              </p>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 bg-zinc-800/40 rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {/* Sin resultados */}
          {!loading && data?.total === 0 && (query || hasFilters) && (
            <div className="glass-card p-12 text-center">
              <p className="text-3xl mb-3">🔍</p>
              <p className="text-zinc-300 font-medium mb-2">Sin resultados</p>
              <p className="text-sm text-zinc-600">
                {query
                  ? `No se encontraron archivos que coincidan con "${query}"`
                  : "No hay archivos con los filtros seleccionados"}
              </p>
              {hasFilters && (
                <button
                  onClick={clearAll}
                  className="mt-4 text-xs text-brand-400 hover:text-brand-200 transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}

          {/* Estado inicial (sin query ni filtros) */}
          {!loading && !data && !query && !hasFilters && (
            <div className="glass-card p-12 text-center">
              <Search size={36} className="text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400 font-medium mb-2">Búsqueda avanzada</p>
              <p className="text-sm text-zinc-600 max-w-sm mx-auto">
                Escribe para buscar por nombre de archivo, artista, título,
                autor, modelo de cámara o cualquier metadata.
              </p>
            </div>
          )}

          {/* Grid de resultados */}
          {!loading && data && data.results.length > 0 && (
            <div className="glass-card overflow-hidden">
              {data.results.map((file) => {
                const thumbSrc = file.thumbnail_url
                  ? `${BASE_URL}${file.thumbnail_url}`
                  : file.file_type === "image"
                    ? `${BASE_URL}${file.file_url}`
                    : null;

                const sub = file.audio_metadata?.artist
                  ? `${file.audio_metadata.artist}${file.audio_metadata.album ? ` · ${file.audio_metadata.album}` : ""}`
                  : file.pdf_metadata?.author
                    ? `Autor: ${file.pdf_metadata.author} · ${file.pdf_metadata.page_count} págs.`
                    : file.image_metadata
                      ? `${file.image_metadata.width}×${file.image_metadata.height} · ${file.image_metadata.megapixels} MP`
                      : file.video_metadata
                        ? `${file.video_metadata.resolution} · ${file.video_metadata.duration_str}`
                        : formatBytes(file.size);

                return (
                  <div
                    key={file.id}
                    onClick={() => setPreview(file)}
                    className="flex items-center gap-4 px-5 py-3.5 border-b border-zinc-800/30
                               last:border-0 hover:bg-zinc-800/30 cursor-pointer transition-colors
                               group"
                  >
                    {/* Thumbnail */}
                    {thumbSrc ? (
                      <img
                        src={thumbSrc}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center
                                      justify-center shrink-0">
                        {typeIcons[file.file_type]}
                      </div>
                    )}

                    {/* Info principal */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-200 group-hover:text-zinc-100
                                   truncate transition-colors">
                        {file.audio_metadata?.title || file.original_name}
                      </p>
                      <p className="text-xs text-zinc-600 truncate">{sub}</p>
                    </div>

                    {/* Tags */}
                    {file.tags.length > 0 && (
                      <div className="flex gap-1.5 shrink-0">
                        {file.tags.slice(0, 3).map((t) => (
                          <TagBadge key={t.id} name={t.name} color={t.color} size="xs" />
                        ))}
                      </div>
                    )}

                    {/* Tipo + fecha */}
                    <div className="text-right shrink-0 hidden sm:block">
                      <p className="text-xs font-medium text-zinc-500">
                        {getFileTypeLabel(file.file_type)}
                      </p>
                      <p className="text-xs text-zinc-700">
                        {new Date(file.created_at).toLocaleDateString("es-BO", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-200
                           hover:bg-zinc-800 transition-colors disabled:opacity-30"
              >
                ← Anterior
              </button>
              <span className="text-xs text-zinc-600 px-3">
                Página {page + 1} de {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-200
                           hover:bg-zinc-800 transition-colors disabled:opacity-30"
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>

        {/* Preview modal */}
        {preview && <FilePreview file={preview} onClose={() => setPreview(null)} />}
      </div>
    </MainLayout>
  );
}
