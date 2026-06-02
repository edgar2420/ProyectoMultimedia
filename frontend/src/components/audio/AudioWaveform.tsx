/**
 * AudioWaveform — dibuja la forma de onda de un archivo de audio
 * usando Web Audio API y Canvas. Sin dependencias externas.
 *
 * Props:
 *   src          — URL del archivo de audio
 *   progress     — porcentaje de reproducción (0–1) para el indicador
 *   onSeek       — callback cuando el usuario hace clic en la onda (0–1)
 *   height       — altura del canvas en px (default 72)
 *   colorFilled  — color de la parte ya reproducida
 *   colorEmpty   — color de la parte pendiente
 */
import { useEffect, useRef, useState } from "react";

interface AudioWaveformProps {
  src: string;
  progress: number;
  onSeek?: (ratio: number) => void;
  height?: number;
  colorFilled?: string;
  colorEmpty?: string;
}

const BARS = 120;     // número de barras del waveform
const BAR_GAP = 1;    // píxeles entre barras

export function AudioWaveform({
  src,
  progress,
  onSeek,
  height = 72,
  colorFilled = "#5ccb5f",
  colorEmpty  = "#27272a",
}: AudioWaveformProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const [peaks, setPeaks] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(false);

  // ── Decodifica el audio y calcula los peaks ──────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setPeaks([]);

    const ctx = new AudioContext();

    fetch(src)
      .then((r) => r.arrayBuffer())
      .then((buf) => ctx.decodeAudioData(buf))
      .then((audioBuffer) => {
        if (cancelled) return;
        const data   = audioBuffer.getChannelData(0);
        const step   = Math.floor(data.length / BARS);
        const result: number[] = [];
        for (let i = 0; i < BARS; i++) {
          let sum = 0;
          for (let j = 0; j < step; j++) {
            sum += Math.abs(data[i * step + j] ?? 0);
          }
          result.push(sum / step);
        }
        // Normalizar 0–1
        const max = Math.max(...result, 0.001);
        setPeaks(result.map((v) => v / max));
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) { setError(true); setLoading(false); }
      })
      .finally(() => ctx.close());

    return () => { cancelled = true; };
  }, [src]);

  // ── Dibuja el canvas cuando cambian peaks o progress ────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || peaks.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const w   = canvas.offsetWidth;
    const h   = canvas.offsetHeight;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;

    const dc = canvas.getContext("2d")!;
    dc.scale(dpr, dpr);
    dc.clearRect(0, 0, w, h);

    const barW    = (w - (BARS - 1) * BAR_GAP) / BARS;
    const centerY = h / 2;

    peaks.forEach((peak, i) => {
      const barH    = Math.max(2, peak * (h - 4));
      const x       = i * (barW + BAR_GAP);
      const ratio   = (i + 0.5) / BARS;
      const filled  = ratio <= progress;

      // Barra superior
      dc.fillStyle = filled ? colorFilled : colorEmpty;
      dc.beginPath();
      dc.roundRect(x, centerY - barH / 2, barW, barH / 2, 1);
      dc.fill();

      // Barra inferior (reflejo atenuado)
      dc.globalAlpha = 0.3;
      dc.beginPath();
      dc.roundRect(x, centerY, barW, barH / 2, 1);
      dc.fill();
      dc.globalAlpha = 1;
    });

    // Cursor de posición
    if (progress > 0 && progress < 1) {
      const cursorX = progress * w;
      dc.strokeStyle = colorFilled;
      dc.lineWidth   = 1.5;
      dc.setLineDash([3, 3]);
      dc.beginPath();
      dc.moveTo(cursorX, 0);
      dc.lineTo(cursorX, h);
      dc.stroke();
      dc.setLineDash([]);
    }
  }, [peaks, progress, colorFilled, colorEmpty]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSeek) return;
    const rect  = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(Math.max(0, Math.min(1, ratio)));
  };

  if (error) return (
    <div className="h-[72px] flex items-center justify-center text-xs text-zinc-600">
      No se pudo cargar la onda
    </div>
  );

  if (loading) return (
    <div className="h-[72px] flex items-center justify-center gap-1">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="w-1 rounded-full bg-zinc-700 animate-pulse"
          style={{
            height: `${12 + Math.random() * 32}px`,
            animationDelay: `${i * 50}ms`,
          }}
        />
      ))}
    </div>
  );

  return (
    <canvas
      ref={canvasRef}
      height={height}
      className="w-full cursor-pointer"
      style={{ height }}
      onClick={handleClick}
    />
  );
}
