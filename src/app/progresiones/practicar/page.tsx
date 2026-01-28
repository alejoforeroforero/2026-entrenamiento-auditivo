'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Play, RotateCcw, SkipForward, Check, X, Piano, Music, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTone } from '@/hooks/useTone';
import { useProgressionStore, StoredProgression } from '@/stores/progression-store';
import { buildProgression, getRandomKey } from '@/lib/music';
import { Chord, NoteName } from '@/types/music';
import { RepertoireEntry } from '@/types/admin';

const REPERTOIRE_STORAGE_KEY = 'ea-repertoire';

const majorChords = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const minorChords = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii°'];

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number; target: YTPlayer }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  destroy: () => void;
  getPlayerState: () => number;
}

function loadRepertoireFromStorage(): RepertoireEntry[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(REPERTOIRE_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function getRandomItem<T>(array: T[]): T | null {
  if (array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

// Piano Mode Component
function PianoMode() {
  const { progressions } = useProgressionStore();
  const [currentProgression, setCurrentProgression] = useState<StoredProgression | null>(null);
  const [currentKey, setCurrentKey] = useState<NoteName>('C');
  const [chords, setChords] = useState<Chord[]>([]);
  const [selectedChords, setSelectedChords] = useState<string[]>([]);
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { initialize, isReady, playProgression, stop, isPlaying } = useTone();

  useEffect(() => {
    setMounted(true);
  }, []);

  const generateNewProgression = useCallback(() => {
    const progression = getRandomItem(progressions);
    if (!progression) return;

    const key = getRandomKey();
    const mode = progression.numerals[0] === 'i' || progression.numerals[0] === 'iv' ? 'minor' : 'major';
    const builtChords = buildProgression(key, progression.numerals, mode);

    setCurrentProgression(progression);
    setCurrentKey(key);
    setChords(builtChords);
    setSelectedChords([]);
    setHasChecked(false);
    setIsCorrect(false);
  }, [progressions]);

  const handlePlay = useCallback(async () => {
    if (!isReady) {
      await initialize();
    }

    if (isPlaying) {
      stop();
      return;
    }

    if (!currentProgression || chords.length === 0) {
      const progression = getRandomItem(progressions);
      if (!progression) return;

      const key = getRandomKey();
      const mode = progression.numerals[0] === 'i' || progression.numerals[0] === 'iv' ? 'minor' : 'major';
      const builtChords = buildProgression(key, progression.numerals, mode);

      setCurrentProgression(progression);
      setCurrentKey(key);
      setChords(builtChords);
      setSelectedChords([]);
      setHasChecked(false);
      setIsCorrect(false);

      playProgression(builtChords, 60);
    } else {
      playProgression(chords, 60);
    }
  }, [isReady, initialize, isPlaying, stop, currentProgression, chords, playProgression, progressions]);

  const handleReplay = useCallback(async () => {
    if (chords.length === 0) return;

    if (!isReady) {
      await initialize();
    }

    if (isPlaying) {
      stop();
    }

    playProgression(chords, 60);
  }, [isReady, initialize, isPlaying, stop, chords, playProgression]);

  const handleNext = useCallback(() => {
    stop();
    generateNewProgression();
  }, [stop, generateNewProgression]);

  const handleChordSelect = (chord: string) => {
    if (hasChecked) return;
    if (currentProgression && selectedChords.length < currentProgression.numerals.length) {
      setSelectedChords([...selectedChords, chord]);
    }
  };

  const handleRemoveChord = (index: number) => {
    if (hasChecked) return;
    setSelectedChords(selectedChords.filter((_, i) => i !== index));
  };

  const handleCheck = () => {
    if (!currentProgression || selectedChords.length !== currentProgression.numerals.length) return;

    const correct = selectedChords.every(
      (chord, index) => chord.toLowerCase() === currentProgression.numerals[index].toLowerCase()
    );

    setIsCorrect(correct);
    setHasChecked(true);
  };

  const handleClear = () => {
    setSelectedChords([]);
    setHasChecked(false);
    setIsCorrect(false);
  };

  if (!mounted) {
    return <p className="text-muted-foreground text-center py-8">Cargando...</p>;
  }

  if (progressions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          No hay progresiones registradas para practicar.
        </p>
        <Button variant="outline" asChild>
          <a href="/admin">Agregar progresiones en Admin</a>
        </Button>
      </div>
    );
  }

  const progressionLength = currentProgression?.numerals.length || 4;

  return (
    <div className="space-y-6">
      {/* Player controls */}
      <Card className="p-6">
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={handleReplay}
            disabled={chords.length === 0}
          >
            <RotateCcw className="w-4 h-4" />
            Repetir
          </Button>
          <Button
            size="lg"
            className="gap-2"
            onClick={handlePlay}
          >
            <Play className="w-4 h-4" />
            {currentProgression ? (isPlaying ? 'Detener' : 'Reproducir') : 'Comenzar'}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={handleNext}
          >
            <SkipForward className="w-4 h-4" />
            Siguiente
          </Button>
        </div>
      </Card>

      {/* Selected chords display */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Tu respuesta ({selectedChords.length}/{progressionLength})
        </h3>
        <div className="flex gap-2 min-h-[60px]">
          {Array.from({ length: progressionLength }).map((_, index) => {
            const chord = selectedChords[index];
            const isCorrectChord = hasChecked && currentProgression &&
              chord?.toLowerCase() === currentProgression.numerals[index]?.toLowerCase();
            const isWrongChord = hasChecked && chord && !isCorrectChord;

            return (
              <button
                key={index}
                onClick={() => chord && handleRemoveChord(index)}
                disabled={!chord || hasChecked}
                className={`
                  w-14 h-14 rounded-xl font-semibold text-lg
                  transition-all duration-200 border-2 border-dashed
                  ${chord
                    ? hasChecked
                      ? isCorrectChord
                        ? 'bg-green-500 text-white border-green-500 border-solid'
                        : 'bg-red-500 text-white border-red-500 border-solid'
                      : 'bg-primary text-primary-foreground border-primary border-solid cursor-pointer hover:opacity-80'
                    : 'border-muted-foreground/30 text-muted-foreground/50'
                  }
                `}
              >
                {chord || (index + 1)}
              </button>
            );
          })}
        </div>

        {hasChecked && !isCorrect && currentProgression && (
          <div className="pt-2">
            <p className="text-sm text-muted-foreground mb-2">Respuesta correcta:</p>
            <div className="flex gap-2">
              {currentProgression.numerals.map((numeral, index) => (
                <div
                  key={index}
                  className="w-14 h-14 rounded-xl font-semibold text-lg bg-green-500/20 text-green-600 border-2 border-green-500 flex items-center justify-center"
                >
                  {numeral}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleCheck}
          disabled={selectedChords.length !== progressionLength || hasChecked}
          className="gap-2"
        >
          <Check className="w-4 h-4" />
          Verificar
        </Button>
        <Button
          variant="outline"
          onClick={handleClear}
          disabled={selectedChords.length === 0}
          className="gap-2"
        >
          <X className="w-4 h-4" />
          Borrar
        </Button>
      </div>

      {/* Feedback */}
      {hasChecked && (
        <Card className={`p-4 ${isCorrect ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}`}>
          <p className={`font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {isCorrect ? '¡Correcto!' : 'Incorrecto'}
          </p>
          {currentProgression && (
            <p className="text-sm text-muted-foreground mt-1">
              Progresión: {currentProgression.name} en {currentKey}
            </p>
          )}
        </Card>
      )}

      {/* Chord selection */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Selecciona los acordes en orden
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Mayores</p>
            <div className="flex flex-wrap gap-2">
              {majorChords.map((chord) => (
                <button
                  key={chord}
                  onClick={() => handleChordSelect(chord)}
                  disabled={hasChecked || selectedChords.length >= progressionLength}
                  className="w-14 h-14 rounded-xl font-semibold text-lg transition-all duration-200 bg-secondary hover:bg-secondary/80 text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {chord}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Menores</p>
            <div className="flex flex-wrap gap-2">
              {minorChords.map((chord) => (
                <button
                  key={chord}
                  onClick={() => handleChordSelect(chord)}
                  disabled={hasChecked || selectedChords.length >= progressionLength}
                  className="w-14 h-14 rounded-xl font-semibold text-lg transition-all duration-200 bg-secondary hover:bg-secondary/80 text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {chord}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Repertoire Mode Component
function RepertoireMode() {
  const { progressions } = useProgressionStore();
  const [repertoire, setRepertoire] = useState<RepertoireEntry[]>([]);
  const [currentSong, setCurrentSong] = useState<RepertoireEntry | null>(null);
  const [selectedChords, setSelectedChords] = useState<string[]>([]);
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playerId = 'practice-player';

  useEffect(() => {
    setMounted(true);
    setRepertoire(loadRepertoireFromStorage());
  }, []);

  // Load YouTube API
  useEffect(() => {
    if (!mounted) return;

    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        return;
      }

      if (!document.getElementById('youtube-api')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
    };

    loadYouTubeAPI();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      playerRef.current?.destroy();
    };
  }, [mounted]);

  const initPlayer = useCallback((song: RepertoireEntry) => {
    if (!window.YT || !containerRef.current) return;

    // Destroy existing player
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
      setIsPlayerReady(false);
    }

    // Clear existing player div
    const existingDiv = document.getElementById(playerId);
    if (existingDiv) {
      existingDiv.remove();
    }

    // Create new player div
    const playerDiv = document.createElement('div');
    playerDiv.id = playerId;
    containerRef.current.appendChild(playerDiv);

    const startTime = song.startTime ?? 0;

    new window.YT.Player(playerId, {
      videoId: song.youtubeId,
      playerVars: {
        controls: 0,
        disablekb: 1,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        start: Math.floor(startTime),
      },
      events: {
        onReady: (event) => {
          playerRef.current = event.target;
          setIsPlayerReady(true);
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
          } else if (
            event.data === window.YT.PlayerState.PAUSED ||
            event.data === window.YT.PlayerState.ENDED
          ) {
            setIsPlaying(false);
          }
        },
      },
    });
  }, []);

  const selectRandomSong = useCallback(() => {
    const song = getRandomItem(repertoire);
    if (!song) return;

    setCurrentSong(song);
    setSelectedChords([]);
    setHasChecked(false);
    setIsCorrect(false);
    setIsPlayerReady(false);

    // Wait for YT API and init player
    const checkAndInit = () => {
      if (window.YT && window.YT.Player) {
        initPlayer(song);
      } else {
        setTimeout(checkAndInit, 100);
      }
    };
    checkAndInit();
  }, [repertoire, initPlayer]);

  const handlePlay = useCallback(() => {
    if (!currentSong) {
      selectRandomSong();
      return;
    }

    if (!playerRef.current || !isPlayerReady) return;

    const startTime = currentSong.startTime ?? 0;
    const duration = currentSong.duration ?? 10;

    if (isPlaying) {
      playerRef.current.pauseVideo();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    } else {
      playerRef.current.seekTo(startTime, true);
      playerRef.current.playVideo();

      timerRef.current = setTimeout(() => {
        playerRef.current?.pauseVideo();
        setIsPlaying(false);
      }, duration * 1000);
    }
  }, [currentSong, isPlaying, isPlayerReady, selectRandomSong]);

  const handleNext = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    playerRef.current?.pauseVideo();
    selectRandomSong();
  }, [selectRandomSong]);

  const handleChordSelect = (chord: string) => {
    if (hasChecked || !currentSong) return;
    if (selectedChords.length < currentSong.progression.length) {
      setSelectedChords([...selectedChords, chord]);
    }
  };

  const handleRemoveChord = (index: number) => {
    if (hasChecked) return;
    setSelectedChords(selectedChords.filter((_, i) => i !== index));
  };

  const handleCheck = () => {
    if (!currentSong || selectedChords.length !== currentSong.progression.length) return;

    const correct = selectedChords.every(
      (chord, index) => chord.toLowerCase() === currentSong.progression[index].toLowerCase()
    );

    setIsCorrect(correct);
    setHasChecked(true);
  };

  const handleClear = () => {
    setSelectedChords([]);
    setHasChecked(false);
    setIsCorrect(false);
  };

  if (!mounted) {
    return <p className="text-muted-foreground text-center py-8">Cargando...</p>;
  }

  if (repertoire.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          No hay canciones en el repertorio para practicar.
        </p>
        <Button variant="outline" asChild>
          <a href="/admin">Agregar canciones en Admin</a>
        </Button>
      </div>
    );
  }

  const progressionLength = currentSong?.progression.length || 4;

  return (
    <div className="space-y-6">
      {/* Video player */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          {/* Small video */}
          <div
            ref={containerRef}
            className="w-40 h-24 bg-black relative rounded overflow-hidden shrink-0"
          >
            {!isPlayerReady && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-xs">
                {currentSong ? '...' : 'Sin canción'}
              </div>
            )}
          </div>

          {/* Song info and controls */}
          <div className="flex-1 min-w-0">
            {currentSong ? (
              <>
                <p className="font-medium truncate">{currentSong.title}</p>
                <p className="text-sm text-muted-foreground truncate">{currentSong.artist}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentSong.key} {currentSong.mode === 'major' ? 'Mayor' : 'menor'}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">Presiona comenzar para seleccionar una canción</p>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              onClick={handlePlay}
              disabled={currentSong !== null && !isPlayerReady}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleNext}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Selected chords display */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Tu respuesta ({selectedChords.length}/{progressionLength})
        </h3>
        <div className="flex gap-2 min-h-[60px]">
          {Array.from({ length: progressionLength }).map((_, index) => {
            const chord = selectedChords[index];
            const isCorrectChord = hasChecked && currentSong &&
              chord?.toLowerCase() === currentSong.progression[index]?.toLowerCase();

            return (
              <button
                key={index}
                onClick={() => chord && handleRemoveChord(index)}
                disabled={!chord || hasChecked}
                className={`
                  w-14 h-14 rounded-xl font-semibold text-lg
                  transition-all duration-200 border-2 border-dashed
                  ${chord
                    ? hasChecked
                      ? isCorrectChord
                        ? 'bg-green-500 text-white border-green-500 border-solid'
                        : 'bg-red-500 text-white border-red-500 border-solid'
                      : 'bg-primary text-primary-foreground border-primary border-solid cursor-pointer hover:opacity-80'
                    : 'border-muted-foreground/30 text-muted-foreground/50'
                  }
                `}
              >
                {chord || (index + 1)}
              </button>
            );
          })}
        </div>

        {hasChecked && !isCorrect && currentSong && (
          <div className="pt-2">
            <p className="text-sm text-muted-foreground mb-2">Respuesta correcta:</p>
            <div className="flex gap-2">
              {currentSong.progression.map((numeral, index) => (
                <div
                  key={index}
                  className="w-14 h-14 rounded-xl font-semibold text-lg bg-green-500/20 text-green-600 border-2 border-green-500 flex items-center justify-center"
                >
                  {numeral}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleCheck}
          disabled={!currentSong || selectedChords.length !== progressionLength || hasChecked}
          className="gap-2"
        >
          <Check className="w-4 h-4" />
          Verificar
        </Button>
        <Button
          variant="outline"
          onClick={handleClear}
          disabled={selectedChords.length === 0}
          className="gap-2"
        >
          <X className="w-4 h-4" />
          Borrar
        </Button>
      </div>

      {/* Feedback */}
      {hasChecked && currentSong && (
        <Card className={`p-4 ${isCorrect ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}`}>
          <p className={`font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {isCorrect ? '¡Correcto!' : 'Incorrecto'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {currentSong.title} - {currentSong.artist}
          </p>
        </Card>
      )}

      {/* Chord selection */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Selecciona los acordes en orden
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Mayores</p>
            <div className="flex flex-wrap gap-2">
              {majorChords.map((chord) => (
                <button
                  key={chord}
                  onClick={() => handleChordSelect(chord)}
                  disabled={!currentSong || hasChecked || selectedChords.length >= progressionLength}
                  className="w-14 h-14 rounded-xl font-semibold text-lg transition-all duration-200 bg-secondary hover:bg-secondary/80 text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {chord}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Menores</p>
            <div className="flex flex-wrap gap-2">
              {minorChords.map((chord) => (
                <button
                  key={chord}
                  onClick={() => handleChordSelect(chord)}
                  disabled={!currentSong || hasChecked || selectedChords.length >= progressionLength}
                  className="w-14 h-14 rounded-xl font-semibold text-lg transition-all duration-200 bg-secondary hover:bg-secondary/80 text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {chord}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PracticarPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Practicar
        </h1>
        <p className="text-muted-foreground mt-1">
          Escucha y selecciona los acordes en orden
        </p>
      </div>

      <Tabs defaultValue="piano" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="piano" className="gap-2">
            <Piano className="w-4 h-4" />
            Acordes Piano
          </TabsTrigger>
          <TabsTrigger value="repertoire" className="gap-2">
            <Music className="w-4 h-4" />
            Repertorio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="piano">
          <PianoMode />
        </TabsContent>

        <TabsContent value="repertoire">
          <RepertoireMode />
        </TabsContent>
      </Tabs>
    </div>
  );
}
