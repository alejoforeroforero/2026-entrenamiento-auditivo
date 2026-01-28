'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Chord, RhythmPattern } from '@/types/music';

// Dynamic import to avoid SSR issues
const importToneEngine = () => import('@/lib/audio/tone-engine').then(mod => mod.getToneEngine());

export function useTone() {
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [tempo, setTempo] = useState(100);
  const engineRef = useRef<Awaited<ReturnType<typeof importToneEngine>> | null>(null);

  const initialize = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      const engine = await importToneEngine();
      await engine.initialize();
      engineRef.current = engine;
      setIsReady(true);
    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
    }
  }, []);

  const playChord = useCallback((chord: Chord, duration?: string) => {
    engineRef.current?.playChord(chord, duration);
  }, []);

  const playProgression = useCallback((chords: Chord[], bpm?: number) => {
    if (!engineRef.current) return;

    const actualTempo = bpm || tempo;
    setIsPlaying(true);
    setCurrentBeat(0);

    engineRef.current.playProgression(chords, actualTempo, (beat) => {
      if (beat === -1) {
        setIsPlaying(false);
        setCurrentBeat(-1);
      } else {
        setCurrentBeat(beat);
      }
    });
  }, [tempo]);

  const playRhythm = useCallback((pattern: RhythmPattern, loops?: number) => {
    if (!engineRef.current) return;

    setIsPlaying(true);
    setCurrentBeat(0);

    engineRef.current.playRhythm(pattern, loops, (beat) => {
      if (beat === -1) {
        setIsPlaying(false);
        setCurrentBeat(-1);
      } else {
        setCurrentBeat(beat);
      }
    });
  }, []);

  const stop = useCallback(() => {
    engineRef.current?.stop();
    setIsPlaying(false);
    setCurrentBeat(-1);
  }, []);

  const changeTempo = useCallback((newTempo: number) => {
    setTempo(newTempo);
    engineRef.current?.setTempo(newTempo);
  }, []);

  useEffect(() => {
    return () => {
      engineRef.current?.stop();
    };
  }, []);

  return {
    isReady,
    isPlaying,
    currentBeat,
    tempo,
    initialize,
    playChord,
    playProgression,
    playRhythm,
    stop,
    setTempo: changeTempo,
  };
}
