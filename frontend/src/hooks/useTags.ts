import { useState, useEffect, useCallback } from "react";
import { tagsService } from "../services/tags";
import type { Tag } from "../services/tags";

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    tagsService.list()
      .then(setTags)
      .catch(() => setTags([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const create = useCallback(async (name: string, color: string) => {
    const tag = await tagsService.create(name, color);
    setTags((prev) => [...prev, tag].sort((a, b) => a.name.localeCompare(b.name)));
    return tag;
  }, []);

  const remove = useCallback(async (id: number) => {
    await tagsService.delete(id);
    setTags((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const update = useCallback(async (id: number, data: { name?: string; color?: string }) => {
    const tag = await tagsService.update(id, data);
    setTags((prev) => prev.map((t) => (t.id === id ? tag : t)));
    return tag;
  }, []);

  return { tags, loading, refetch: fetch, create, remove, update };
}
