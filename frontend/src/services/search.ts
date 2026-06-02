import { api } from "./api";
import type { MediaFile } from "./files";

export interface SearchParams {
  q?: string;
  type?: string[];           // multi-tipo: ["image", "video"]
  tag_id?: number[];
  date_from?: string;
  date_to?: string;
  min_size?: number;
  max_size?: number;
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: string;
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

export interface SearchResponse {
  total: number;
  took_ms: number;
  query: string;
  limit: number;
  offset: number;
  results: MediaFile[];
}

export const searchService = {
  search: async (params: SearchParams): Promise<SearchResponse> => {
    const p: Record<string, string | string[] | number> = {};

    if (params.q)              p.q           = params.q;
    if (params.type?.length)   p.type        = params.type;          // axios repite el param
    if (params.tag_id?.length) p.tag_id      = params.tag_id.map(String);
    if (params.date_from)      p.date_from   = params.date_from;
    if (params.date_to)        p.date_to     = params.date_to;
    if (params.min_size != null) p.min_size  = params.min_size;
    if (params.max_size != null) p.max_size  = params.max_size;
    if (params.sort_by)        p.sort_by     = params.sort_by;
    if (params.sort_order)     p.sort_order  = params.sort_order;
    p.limit  = params.limit  ?? 30;
    p.offset = params.offset ?? 0;
    // imagen
    if (params.min_width != null)  p.min_width  = params.min_width;
    if (params.max_width != null)  p.max_width  = params.max_width;
    if (params.min_height != null) p.min_height = params.min_height;
    if (params.max_height != null) p.max_height = params.max_height;
    if (params.camera_make)        p.camera_make = params.camera_make;
    if (params.has_exif)           p.has_exif   = "true";
    // video
    if (params.min_duration != null)  p.min_duration   = params.min_duration;
    if (params.max_duration != null)  p.max_duration   = params.max_duration;
    if (params.video_codec)           p.video_codec    = params.video_codec;
    if (params.min_fps != null)       p.min_fps        = params.min_fps;
    if (params.has_audio)             p.has_audio      = "true";
    if (params.min_video_width != null) p.min_video_width = params.min_video_width;
    // audio
    if (params.min_audio_duration != null) p.min_audio_duration = params.min_audio_duration;
    if (params.max_audio_duration != null) p.max_audio_duration = params.max_audio_duration;
    if (params.artist)      p.artist      = params.artist;
    if (params.album)       p.album       = params.album;
    if (params.genre)       p.genre       = params.genre;
    if (params.audio_codec) p.audio_codec = params.audio_codec;
    // pdf
    if (params.min_pages != null) p.min_pages  = params.min_pages;
    if (params.max_pages != null) p.max_pages  = params.max_pages;
    if (params.pdf_author)  p.pdf_author = params.pdf_author;
    if (params.pdf_title)   p.pdf_title  = params.pdf_title;

    return api.get<SearchResponse>("/media/files/search/", { params: p }).then((r) => r.data);
  },
};
