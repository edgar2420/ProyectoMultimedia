import { useState, useEffect, useCallback } from "react";
import { filesService } from "../services/files";
import type { MediaFile, ListFilesParams } from "../services/files";

export function useFiles(params?: ListFilesParams) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paramsKey = JSON.stringify(params ?? {});

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    filesService.list(params)
      .then(setFiles)
      .catch(() => setError("Error al cargar los archivos"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => { fetch(); }, [fetch]);

  const remove = useCallback(async (id: number) => {
    await filesService.delete(id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const addFile = useCallback((file: MediaFile) => {
    setFiles((prev) => [file, ...prev]);
  }, []);

  return { files, loading, error, refetch: fetch, remove, addFile };
}
