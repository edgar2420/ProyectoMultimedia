/**
 * AudioPlayer — reproductor de audio con waveform, controles customizados
 * y visualización de progreso. Usa Web Audio API via AudioWaveform.
 */
import { useRef, useState, useCallback, useEffect } from "react";
import {
  Play, Pause, Volume2, VolumeX, SkipBack, SkipForward,
} from "lucide-react";
import { AudioWaveform } from "./AudioWaveform";
import type { AudioMetadata } from "../../services/files";

interface AudioPlayerProps {
  src: string;
  title: string;
  artist?: string | null;
  album?: string | null;
  metadata?: AudioMetadata | null;
}

function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function AudioPlayer({
  src, title, artist, album, metadata,
}: AudioPlayerProps) {
  const audioRef  = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying]   = useState(false);
  const [progress, setProgress] = useState(0);       // 0–1
  const [current, setCurrent]   = useState(0);       // segundos
  const [duration, setDuration] = useState(
    metadata?.duration_seconds ?? 0
  );
  const [volume, setVolume]     = useState(1);
  const [muted, setMuted]       = useState(false);

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { a.play(); setPlaying(true); }
    else          { a.pause(); setPlaying(false); }
  }, []);

  const seek = useCallback((ratio: number) => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    a.currentTime = ratio * a.duration;
  }, []);

  const skipBack = useCallback(() => {
    const a = audioRef.current;
    if (a) a.currentTime = Math.max(0, a.currentTime - 10);
  }, []);

  const skipForward = useCallback(() => {
    const a = audioRef.current;
    if (a) a.currentTime = Math.min(a.duration || 0, a.currentTime + 10);
  }, []);

  const toggleMute = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !a.muted;
    setMuted(a.muted);
  }, []);

  const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
      audioRef.current.muted = v === 0;
      setMuted(v === 0);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        togglePlay();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [togglePlay]);

  return (
    <div className="flex flex-col gap-4 p-5 w-full">
      {/* ── Identificación de la pista ── */}
      <div className="flex items-center gap-4">
        {/* Disco animado */}
        <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-brand-800 to-brand-950
                         flex items-center justify-center shrink-0 shadow-lg shadow-brand-950/50
                         ${playing ? "animate-spin" : ""}`}
             style={{ animationDuration: "3s" }}>
          <div className="w-5 h-5 rounded-full bg-zinc-950" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-100 truncate">
            {metadata?.title || title}
          </p>
          <p className="text-xs text-zinc-400 truncate">
            {metadata?.artist || artist || "Artista desconocido"}
          </p>
          {(metadata?.album || album) && (
            <p className="text-xs text-zinc-600 truncate">
              {metadata?.album || album}
              {metadata?.year ? ` · ${metadata.year}` : ""}
            </p>
          )}
        </div>

        {/* Tags rápidos */}
        {metadata?.genre && (
          <span className="ml-auto shrink-0 text-[10px] font-medium px-2 py-1
                           rounded-full bg-brand-950/60 text-brand-400 border border-brand-800/30">
            {metadata.genre}
          </span>
        )}
      </div>

      {/* ── Waveform ── */}
      <div className="bg-zinc-900/60 rounded-xl px-3 py-2">
        <AudioWaveform
          src={src}
          progress={progress}
          onSeek={seek}
          height={72}
          colorFilled="#5ccb5f"
          colorEmpty="#3f3f46"
        />
      </div>

      {/* ── Barra de tiempo ── */}
      <div className="flex items-center justify-between text-xs text-zinc-500 -mt-2">
        <span>{fmtTime(current)}</span>
        <span>{fmtTime(duration)}</span>
      </div>

      {/* ── Controles ── */}
      <div className="flex items-center justify-between">
        {/* Volumen */}
        <div className="flex items-center gap-2 w-28">
          <button
            onClick={toggleMute}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {muted || volume === 0
              ? <VolumeX size={16} />
              : <Volume2 size={16} />
            }
          </button>
          <input
            type="range" min="0" max="1" step="0.05"
            value={muted ? 0 : volume}
            onChange={handleVolume}
            className="flex-1 h-1 accent-brand-400 cursor-pointer"
          />
        </div>

        {/* Playback */}
        <div className="flex items-center gap-3">
          <button
            onClick={skipBack}
            title="-10s"
            className="w-8 h-8 flex items-center justify-center rounded-full
                       text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <SkipBack size={16} />
          </button>

          <button
            onClick={togglePlay}
            className="w-12 h-12 flex items-center justify-center rounded-full
                       bg-brand-600 hover:bg-brand-400 text-white shadow-lg
                       shadow-brand-600/30 transition-all active:scale-95"
          >
            {playing
              ? <Pause size={20} fill="white" />
              : <Play  size={20} fill="white" className="ml-0.5" />
            }
          </button>

          <button
            onClick={skipForward}
            title="+10s"
            className="w-8 h-8 flex items-center justify-center rounded-full
                       text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <SkipForward size={16} />
          </button>
        </div>

        {/* Info técnica */}
        <div className="w-28 text-right">
          {metadata && (
            <span className="text-[10px] text-zinc-600">
              {metadata.codec.toUpperCase()} · {metadata.bitrate_kbps} kbps
            </span>
          )}
        </div>
      </div>

      {/* ── Audio element oculto ── */}
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={() => {
          const a = audioRef.current;
          if (!a || !a.duration) return;
          setCurrent(a.currentTime);
          setProgress(a.currentTime / a.duration);
        }}
        onLoadedMetadata={() => {
          const a = audioRef.current;
          if (a) setDuration(a.duration);
        }}
        onEnded={() => { setPlaying(false); setProgress(0); setCurrent(0); }}
        className="hidden"
      />
    </div>
  );
}
