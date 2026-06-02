import { useState, useEffect, useCallback, useRef } from "react";
import { searchService } from "../services/search";
import type { SearchParams, SearchResponse } from "../services/search";

const DEBOUNCE_MS = 350;

export function useSearch(params: SearchParams, enabled = true) {
  const [data, setData]       = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paramsKey = JSON.stringify(params);

  const run = useCallback((p: SearchParams) => {
    const hasQuery = !!p.q?.trim();
    const hasFilters = !!(
      p.type?.length || p.tag_id?.length ||
      p.date_from || p.date_to ||
      p.min_size != null || p.max_size != null ||
      p.min_width != null || p.max_width != null ||
      p.min_height != null || p.max_height != null ||
      p.camera_make || p.has_exif ||
      p.min_duration != null || p.max_duration != null ||
      p.video_codec || p.min_fps != null || p.has_audio ||
      p.artist || p.album || p.genre ||
      p.min_audio_duration != null || p.max_audio_duration != null ||
      p.min_pages != null || p.max_pages != null ||
      p.pdf_author || p.pdf_title
    );
    if (!hasQuery && !hasFilters) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    searchService.search(p)
      .then(setData)
      .catch(() => setError("Error al buscar"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => run(params), DEBOUNCE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, enabled]);

  const search = useCallback((p: SearchParams) => run(p), [run]);

  return { data, loading, error, search };
}

// Hook de búsqueda instantánea para el Navbar (sin debounce largo)
export function useQuickSearch(query: string) {
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim() || query.length < 2) {
      setResults(null);
      return;
    }
    timerRef.current = setTimeout(() => {
      setLoading(true);
      searchService.search({ q: query, limit: 6 })
        .then(setResults)
        .catch(() => setResults(null))
        .finally(() => setLoading(false));
    }, 250);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  return { results, loading };
}
