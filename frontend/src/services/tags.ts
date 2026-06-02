import { api } from "./api";

export interface Tag {
  id: number;
  name: string;
  color: string;
  owner_id: number;
  file_count: number;
  created_at: string;
}

export const TAG_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#10b981",
  "#5ccb5f", "#3b82f6", "#8b5cf6", "#ec4899",
  "#06b6d4", "#6b7280",
];

export const tagsService = {
  list: () =>
    api.get<Tag[]>("/tags/").then((r) => r.data),

  create: (name: string, color: string) =>
    api.post<Tag>("/tags/create/", { name, color }).then((r) => r.data),

  update: (id: number, data: { name?: string; color?: string }) =>
    api.patch<Tag>(`/tags/${id}/update/`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/tags/${id}/delete/`),

  getFileTags: (fileId: number) =>
    api.get<Tag[]>(`/tags/file/${fileId}/`).then((r) => r.data),

  setFileTags: (fileId: number, tagIds: number[]) =>
    api.put<Tag[]>(`/tags/file/${fileId}/set/`, { tag_ids: tagIds }).then((r) => r.data),

  bulkSetTags: (fileIds: number[], tagIds: number[]) =>
    api.post("/tags/bulk/set/", { file_ids: fileIds, tag_ids: tagIds }),
};
