import { useCallback, useEffect, useRef, useState } from "react";

// Note frequencies (Hz)
const C4=261.63, E4=329.63;
const C5=523.25, D5=587.33, E5=659.25, F5=698.46, G5=783.99, A5=880.00, C6=1046.50;

// Background melody: [frequency, duration in seconds]
const BG_MELODY: [number, number][] = [
  [C5,0.3],[E5,0.3],[G5,0.3],[E5,0.3],
  [F5,0.3],[A5,0.3],[G5,0.3],[E5,0.3],
  [D5,0.3],[F5,0.3],[E5,0.3],[C5,0.6],
];

export function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const mutedRef = useRef(false);
  const [muted, setMuted] = useState(false);
  const bgStateRef = useRef({ playing: false, idx: 0, timer: null as ReturnType<typeof setTimeout> | null });
  // Stable ref to the scheduler so setTimeout always calls the latest version
  const schedulerRef = useRef<() => void>(() => {});

  function getCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }

  function tone(freq: number, dur: number, type: OscillatorType = "sine", gain = 0.28, when?: number) {
    if (mutedRef.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      osc.type = type;
      osc.frequency.value = freq;
      const t = when ?? ctx.currentTime;
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    } catch { /* ignore if ctx closed */ }
  }

  // Update scheduler ref on every render so it always has fresh closures
  schedulerRef.current = function scheduleBg() {
    const bg = bgStateRef.current;
    if (!bg.playing) return;
    const [freq, dur] = BG_MELODY[bg.idx % BG_MELODY.length];
    bg.idx++;
    if (!mutedRef.current) tone(freq, dur * 0.85, "sine", 0.07);
    bg.timer = setTimeout(() => schedulerRef.current(), dur * 1000);
  };

  const playCorrect = useCallback(() => {
    const ctx = getCtx(); if (!ctx) return;
    const t = ctx.currentTime;
    tone(C5, 0.10, "sine", 0.30, t);
    tone(E5, 0.10, "sine", 0.30, t + 0.10);
    tone(G5, 0.18, "sine", 0.30, t + 0.20);
    tone(C6, 0.30, "sine", 0.28, t + 0.35);
  }, []);

  const playWrong = useCallback(() => {
    const ctx = getCtx(); if (!ctx) return;
    const t = ctx.currentTime;
    tone(E4, 0.15, "triangle", 0.22, t);
    tone(C4, 0.25, "triangle", 0.18, t + 0.18);
  }, []);

  const playClick = useCallback(() => {
    tone(880, 0.04, "sine", 0.10);
  }, []);

  const playVictory = useCallback(() => {
    const ctx = getCtx(); if (!ctx) return;
    const seq: [number, number][] = [[C5,0.12],[E5,0.12],[G5,0.12],[C6,0.16],[G5,0.12],[C6,0.40]];
    let offset = 0;
    seq.forEach(([f, d]) => {
      tone(f, d, "sine", 0.32, ctx.currentTime + offset);
      offset += d + 0.02;
    });
  }, []);

  const startBgMusic = useCallback(() => {
    if (bgStateRef.current.playing) return;
    bgStateRef.current.playing = true;
    bgStateRef.current.idx = 0;
    schedulerRef.current();
  }, []);

  const stopBgMusic = useCallback(() => {
    bgStateRef.current.playing = false;
    if (bgStateRef.current.timer) {
      clearTimeout(bgStateRef.current.timer);
      bgStateRef.current.timer = null;
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => { mutedRef.current = !m; return !m; });
  }, []);

  useEffect(() => {
    return () => {
      bgStateRef.current.playing = false;
      if (bgStateRef.current.timer) clearTimeout(bgStateRef.current.timer);
      ctxRef.current?.close();
    };
  }, []);

  return { playCorrect, playWrong, playClick, playVictory, startBgMusic, stopBgMusic, toggleMute, muted };
}
