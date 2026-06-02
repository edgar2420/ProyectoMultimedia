import { api } from "./api";

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  color_mode: string;
  megapixels: number;
  aspect_ratio: string;
  camera_make: string | null;
  camera_model: string | null;
  date_taken: string | null;
  exposure_time: string | null;
  f_number: string | null;
  iso_speed: number | null;
  focal_length: string | null;
  flash: string | null;
  gps_latitude: number | null;
  gps_longitude: number | null;
  software: string | null;
  orientation: number | null;
  has_exif: boolean;
}

export interface VideoMetadata {
  width: number;
  height: number;
  duration_seconds: number;
  duration_str: string;
  format_name: string;
  format_long_name: string;
  video_codec: string;
  fps: number;
  fps_str: string;
  bitrate_kbps: number;
  audio_codec: string | null;
  audio_channels: number | null;
  audio_sample_rate: number | null;
  has_audio: boolean;
  file_size: number;
  resolution: string;
}

export interface AudioMetadata {
  duration_seconds: number;
  duration_str: string;
  codec: string;
  bitrate_kbps: number;
  sample_rate: number;
  channels: number;
  channels_str: string;
  format_name: string;
  file_size: number;
  title: string | null;
  artist: string | null;
  album: string | null;
  album_artist: string | null;
  year: string | null;
  genre: string | null;
  track_number: string | null;
  comment: string | null;
  composer: string | null;
}

export interface PdfMetadata {
  page_count: number;
  file_size: number;
  title: string | null;
  author: string | null;
  subject: string | null;
  creator: string | null;
  producer: string | null;
  creation_date: string | null;
  modification_date: string | null;
  encrypted: boolean;
  page_width_pt: number | null;
  page_height_pt: number | null;
  page_size_str: string | null;
}

export interface MediaFile {
  id: number;
  name: string;
  original_name: string;
  file_url: string;
  file_type: "image" | "video" | "audio" | "document" | "other";
  mime_type: string;
  size: number;
  owner_id: number;
  folder_id: number | null;
  thumbnail_url: string | null;
  image_metadata: ImageMetadata | null;
  video_metadata: VideoMetadata | null;
  audio_metadata: AudioMetadata | null;
  pdf_metadata: PdfMetadata | null;
  tags: { id: number; name: string; color: string }[];
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: number;
  name: string;
  owner_id: number;
  parent_id: number | null;
  children_count: number;
  files_count: number;
  created_at: string;
  updated_at: string;
}

export type SortBy = "name" | "date" | "size" | "type";
export type SortOrder = "asc" | "desc";

export interface ListFilesParams {
  type?: string;
  search?: string;
  folder_id?: number | null;
  sort_by?: SortBy;
  sort_order?: SortOrder;
  tag_ids?: number[];
}

export interface FolderTreeNode extends Folder {
  children: FolderTreeNode[];
}

export const filesService = {
  list: (params?: ListFilesParams) => {
    const p: Record<string, string> = {};
    if (params?.type) p.type = params.type;
    if (params?.search) p.search = params.search;
    if (params?.sort_by) p.sort_by = params.sort_by;
    if (params?.sort_order) p.sort_order = params.sort_order;
    if (params && "folder_id" in params) {
      p.folder_id = params.folder_id === null ? "" : String(params.folder_id);
    }
    // tag_ids se envían como query params repetidos: ?tag_id=1&tag_id=2
    const extraParams = params?.tag_ids?.length
      ? { ...p, tag_id: params.tag_ids.map(String) }
      : p;
    return api.get<MediaFile[]>("/media/files/", { params: extraParams }).then((r) => r.data);
  },

  upload: (file: File, folderId: number | null, onProgress?: (pct: number) => void) => {
    const form = new FormData();
    form.append("file", file);
    if (folderId !== null) form.append("folder_id", String(folderId));
    return api.post<MediaFile>("/media/files/upload/", form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
      },
    }).then((r) => r.data);
  },

  move: (id: number, folderId: number | null) =>
    api.patch<MediaFile>(`/media/files/${id}/move/`, { folder_id: folderId }).then((r) => r.data),

  delete: (id: number) => api.delete(`/media/files/${id}/delete/`),
};

export interface MediaStats {
  total_files: number;
  total_size: number;
  by_type: { image: number; video: number; audio: number; document: number; other: number };
}

export const statsService = {
  get: () => api.get<MediaStats>("/media/stats/").then((r) => r.data),
};

export const foldersService = {
  list: (parentId: number | null) => {
    const params: Record<string, string> = {};
    if (parentId !== null) params.parent_id = String(parentId);
    return api.get<Folder[]>("/media/folders/", { params }).then((r) => r.data);
  },

  create: (name: string, parentId: number | null) =>
    api.post<Folder>("/media/folders/create/", { name, parent_id: parentId }).then((r) => r.data),

  rename: (id: number, name: string) =>
    api.patch<Folder>(`/media/folders/${id}/rename/`, { name }).then((r) => r.data),

  breadcrumb: (folderId: number) =>
    api.get<Folder[]>(`/media/folders/${folderId}/breadcrumb/`).then((r) => r.data),

  tree: () =>
    api.get<FolderTreeNode[]>("/media/folders/tree/").then((r) => r.data),

  delete: (id: number) => api.delete(`/media/folders/${id}/delete/`),
};

export interface SearchParams {
  q?: string;
  type?: string;
  date_from?: string;
  date_to?: string;
  min_size?: number;
  max_size?: number;
  sort_by?: SortBy;
  sort_order?: SortOrder;
  tag_ids?: number[];
  // imagen
  min_width?: number;
  max_width?: number;
  min_height?: number;
  max_height?: number;
  camera_make?: string;
  has_exif?: boolean;
  // video
  min_duration?: number;
  max_duration?: number;
  video_codec?: string;
  min_fps?: number;
  has_audio?: boolean;
  min_video_width?: number;
  // audio
  min_audio_duration?: number;
  max_audio_duration?: number;
  artist?: string;
  album?: string;
  genre?: string;
  audio_codec?: string;
  // pdf
  min_pages?: number;
  max_pages?: number;
  pdf_author?: string;
  pdf_title?: string;
}

export const searchService = {
  search: (params: SearchParams) => {
    const p: Record<string, string | string[]> = {};
    if (params.q)              p.q              = params.q;
    if (params.type)           p.type           = params.type;
    if (params.date_from)      p.date_from      = params.date_from;
    if (params.date_to)        p.date_to        = params.date_to;
    if (params.min_size != null)  p.min_size    = String(params.min_size);
    if (params.max_size != null)  p.max_size    = String(params.max_size);
    if (params.sort_by)        p.sort_by        = params.sort_by;
    if (params.sort_order)     p.sort_order     = params.sort_order;
    if (params.tag_ids?.length) p.tag_id        = params.tag_ids.map(String);
    // imagen
    if (params.min_width != null)   p.min_width   = String(params.min_width);
    if (params.max_width != null)   p.max_width   = String(params.max_width);
    if (params.min_height != null)  p.min_height  = String(params.min_height);
    if (params.max_height != null)  p.max_height  = String(params.max_height);
    if (params.camera_make)         p.camera_make = params.camera_make;
    if (params.has_exif)            p.has_exif    = "true";
    // video
    if (params.min_duration != null)  p.min_duration    = String(params.min_duration);
    if (params.max_duration != null)  p.max_duration    = String(params.max_duration);
    if (params.video_codec)           p.video_codec     = params.video_codec;
    if (params.min_fps != null)       p.min_fps         = String(params.min_fps);
    if (params.has_audio)             p.has_audio       = "true";
    if (params.min_video_width != null) p.min_video_width = String(params.min_video_width);
    // audio
    if (params.min_audio_duration != null) p.min_audio_duration = String(params.min_audio_duration);
    if (params.max_audio_duration != null) p.max_audio_duration = String(params.max_audio_duration);
    if (params.artist)      p.artist      = params.artist;
    if (params.album)       p.album       = params.album;
    if (params.genre)       p.genre       = params.genre;
    if (params.audio_codec) p.audio_codec = params.audio_codec;
    // pdf
    if (params.min_pages != null)  p.min_pages  = String(params.min_pages);
    if (params.max_pages != null)  p.max_pages  = String(params.max_pages);
    if (params.pdf_author) p.pdf_author = params.pdf_author;
    if (params.pdf_title)  p.pdf_title  = params.pdf_title;

    return api.get<MediaFile[]>("/media/files/search/", { params: p }).then((r) => r.data);
  },
};

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}

export function getFileTypeLabel(type: MediaFile["file_type"]): string {
  return { image: "Imagen", video: "Video", audio: "Audio", document: "Documento", other: "Otro" }[type];
}
