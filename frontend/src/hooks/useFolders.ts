import { useState, useEffect, useCallback } from "react";
import { foldersService } from "../services/files";
import type { Folder, FolderTreeNode } from "../services/files";

export function useFolders(parentId: number | null) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    foldersService.list(parentId)
      .then(setFolders)
      .catch(() => setFolders([]))
      .finally(() => setLoading(false));
  }, [parentId]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = useCallback(async (name: string) => {
    const folder = await foldersService.create(name, parentId);
    setFolders((prev) => [...prev, folder].sort((a, b) => a.name.localeCompare(b.name)));
    return folder;
  }, [parentId]);

  const rename = useCallback(async (id: number, newName: string) => {
    const updated = await foldersService.rename(id, newName);
    setFolders((prev) =>
      prev.map((f) => f.id === id ? updated : f)
          .sort((a, b) => a.name.localeCompare(b.name))
    );
    return updated;
  }, []);

  const remove = useCallback(async (id: number) => {
    await foldersService.delete(id);
    setFolders((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return { folders, loading, refetch: fetch, create, rename, remove };
}

export function useBreadcrumb(folderId: number | null) {
  const [crumbs, setCrumbs] = useState<Folder[]>([]);

  useEffect(() => {
    if (folderId === null) { setCrumbs([]); return; }
    foldersService.breadcrumb(folderId).then(setCrumbs).catch(() => setCrumbs([]));
  }, [folderId]);

  return crumbs;
}

export function useFolderTree() {
  const [tree, setTree] = useState<FolderTreeNode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    foldersService.tree()
      .then(setTree)
      .catch(() => setTree([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { tree, loading, refetch: fetch };
}
