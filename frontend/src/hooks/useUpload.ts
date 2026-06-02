import { useState, useCallback } from "react";
import { filesService } from "../services/files";
import type { MediaFile } from "../services/files";

export interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  result?: MediaFile;
}

export function useUpload(onSuccess?: (file: MediaFile) => void) {
  const [queue, setQueue] = useState<UploadItem[]>([]);

  const update = (id: string, patch: Partial<UploadItem>) =>
    setQueue((prev) => prev.map((item) => item.id === id ? { ...item, ...patch } : item));

  const uploadFiles = useCallback(async (files: File[], folderId: number | null = null) => {
    const items: UploadItem[] = files.map((f) => ({
      id: `${Date.now()}-${Math.random()}`,
      file: f, progress: 0, status: "pending",
    }));
    setQueue((prev) => [...prev, ...items]);

    for (const item of items) {
      update(item.id, { status: "uploading" });
      try {
        const result = await filesService.upload(item.file, folderId, (pct) =>
          update(item.id, { progress: pct })
        );
        update(item.id, { status: "done", progress: 100, result });
        onSuccess?.(result);
      } catch (e: unknown) {
        const msg = (e as { response?: { data?: { detail?: string } } })
          ?.response?.data?.detail ?? "Error al subir el archivo";
        update(item.id, { status: "error", error: msg });
      }
    }
  }, [onSuccess]);

  const clearDone = useCallback(() =>
    setQueue((prev) => prev.filter((i) => i.status !== "done")), []);

  return { queue, uploadFiles, clearDone };
}
