"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

/*
 * Player à waveform. Sans audioUrl (mode démo), il simule la lecture
 * visuellement ; avec une vraie URL (API branchée plus tard), il pilotera
 * un élément <audio>.
 */
export default function WaveformPlayer({
  duration,
  audioUrl,
  accent = "#9d8cff",
}: {
  duration: number;
  audioUrl: string | null;
  accent?: string;
}) {
  const BAR_COUNT = 72;
  const bars = useMemo(
    () =>
      Array.from({ length: BAR_COUNT }, (_, i) => {
        const env = Math.sin((i / BAR_COUNT) * Math.PI); // enveloppe douce
        return 0.15 + env * (0.35 + Math.abs(Math.sin(i * 7.31)) * 0.5);
      }),
    []
  );

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const audioRef = useRef<HTMLAudioElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!playing) return;
    if (audioUrl && audioRef.current) {
      const el = audioRef.current;
      const tick = () => {
        setProgress(el.duration ? el.currentTime / el.duration : 0);
        rafRef.current = requestAnimationFrame(tick);
      };
      el.play();
      rafRef.current = requestAnimationFrame(tick);
      return () => {
        el.pause();
        cancelAnimationFrame(rafRef.current);
      };
    }
    // Mode démo : progression simulée
    startRef.current = performance.now() - progress * duration * 1000;
    const tick = (now: number) => {
      const p = (now - startRef.current) / (duration * 1000);
      if (p >= 1) {
        setProgress(0);
        setPlaying(false);
        return;
      }
      setProgress(p);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, audioUrl, duration]);

  const elapsed = Math.floor(progress * duration);
  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="flex items-center gap-4 w-full">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          onEnded={() => {
            setPlaying(false);
            setProgress(0);
          }}
        />
      )}
      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? "Mettre en pause" : "Lire l'extrait"}
        className="shrink-0 w-12 h-12 rounded-full bg-acid text-ink flex items-center justify-center hover:bg-cream transition-colors cursor-pointer"
        style={{ touchAction: "manipulation" }}
      >
        {playing ? (
          <Pause className="w-5 h-5" aria-hidden="true" />
        ) : (
          <Play className="w-5 h-5 ml-0.5" aria-hidden="true" />
        )}
      </button>

      <div
        className="flex-1 flex items-end gap-[2px] h-14"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={elapsed}
        aria-label="Progression de la lecture"
      >
        {bars.map((h, i) => {
          const active = i / BAR_COUNT <= progress;
          return (
            <span
              key={i}
              className="flex-1 rounded-sm transition-colors duration-150"
              style={{
                minWidth: 1,
                height: `${(h * 100).toFixed(2)}%`,
                background: active ? accent : "rgba(240,237,251,0.3)",
              }}
            />
          );
        })}
      </div>

      <span className="shrink-0 font-mono text-xs text-cream-dim tabular-nums w-20 text-right">
        {fmt(elapsed)} / {fmt(duration)}
      </span>
    </div>
  );
}
