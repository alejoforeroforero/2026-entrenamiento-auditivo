'use client';

import { useState, useCallback, useEffect, useRef, use } from 'react';
import { Play, RotateCcw, SkipForward, Check, X, Piano, Music, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTone } from '@/hooks/useTone';
import { buildProgression, getRandomKey } from '@/lib/music';
import { Chord, NoteName, RomanNumeral } from '@/types/music';
import {
  getRandomSongAction,
  getRandomProgressionAction,
  getProgressionByIdAction,
} from './actions';

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

interface Progression {
  id: string;
  name: string;
  numerals: string[];
  description: string | null;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  key: string;
  mode: 'major' | 'minor';
  youtubeId: string | null;
  startTime: number | null;
  duration: number | null;
  progressionId: string;
  progression: Progression;
}

function PianoMode({ genre }: { genre: string }) {
  const [currentProgression, setCurrentProgression] = useState<Progression | null>(null);
  const [currentKey, setCurrentKey] = useState<NoteName>('C');
  const [chords, setChords] = useState<Chord[]>([]);
  const [selectedChords, setSelectedChords] = useState<string[]>([]);
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const { initialize, isReady, playProgression, stop, isPlaying } = useTone();

  const generateNewProgression = useCallback(async () => {
    const progression = await getRandomProgressionAction(genre);
    if (!progression) return;

    const key = getRandomKey();
    const mode = progression.numerals[0] === 'i' || progression.numerals[0] === 'iv' ? 'minor' : 'major';
    const builtChords = buildProgression(key, progression.numerals as RomanNumeral[], mode);

    setCurrentProgression(progression);
    setCurrentKey(key);
    setChords(builtChords);
    setSelectedChords([]);
    setHasChecked(false);
    setIsCorrect(false);
  }, [genre]);

  const handlePlay = useCallback(async () => {
    if (!isReady) {
      await initialize();
    }

    if (isPlaying) {
      stop();
      return;
    }

    if (!currentProgression || chords.length === 0) {
      const progression = await getRandomProgressionAction(genre);
      if (!progression) return;

      const key = getRandomKey();
      const mode = progression.numerals[0] === 'i' || progression.numerals[0] === 'iv' ? 'minor' : 'major';
      const builtChords = buildProgression(key, progression.numerals as RomanNumeral[], mode);

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
  }, [genre, isReady, initialize, isPlaying, stop, currentProgression, chords, playProgression]);

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
    if (selectedChords.length < 8) {
      setSelectedChords([...selectedChords, chord]);
    }
  };

  const handleRemoveChord = (index: number) => {
    if (hasChecked) return;
    setSelectedChords(selectedChords.filter((_, i) => i !== index));
  };

  const handleCheck = () => {
    if (!currentProgression || selectedChords.length === 0) return;

    const correctLength = selectedChords.length === currentProgression.numerals.length;
    const correctChords = correctLength && selectedChords.every(
      (chord, index) => chord.toLowerCase() === currentProgression.numerals[index].toLowerCase()
    );

    setIsCorrect(correctChords);
    setHasChecked(true);
  };

  const handleClear = () => {
    setSelectedChords([]);
    setHasChecked(false);
    setIsCorrect(false);
  };

  const progressionLength = currentProgression?.numerals.length || 4;

  return (
    <div className="space-y-8">
      <div className="p-8 rounded-3xl bg-card/50 border border-border/50">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            className="gap-2.5 h-12 px-5 rounded-xl bg-secondary/50 border-border/50 hover:bg-secondary hover:border-border"
            onClick={handleReplay}
            disabled={chords.length === 0}
          >
            <RotateCcw className="w-4 h-4" />
            Repetir
          </Button>
          <Button
            size="lg"
            className="gap-2.5 h-14 px-8 rounded-xl text-base glow hover:glow transition-all duration-300"
            onClick={handlePlay}
          >
            <Play className="w-5 h-5" />
            {currentProgression ? (isPlaying ? 'Detener' : 'Reproducir') : 'Comenzar'}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2.5 h-12 px-5 rounded-xl bg-secondary/50 border-border/50 hover:bg-secondary hover:border-border"
            onClick={handleNext}
          >
            <SkipForward className="w-4 h-4" />
            Siguiente
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            Tu respuesta ({selectedChords.length}/{progressionLength})
          </h3>
          <p className="text-xs text-muted-foreground/70">
            No todas las casillas deben llenarse
          </p>
        </div>
        <div className="flex gap-3 min-h-[72px] flex-wrap">
          {Array.from({ length: 8 }).map((_, index) => {
            const chord = selectedChords[index];
            const isWithinProgression = index < progressionLength;
            const isCorrectChord = hasChecked && currentProgression &&
              chord?.toLowerCase() === currentProgression.numerals[index]?.toLowerCase();

            return (
              <button
                key={index}
                onClick={() => chord && handleRemoveChord(index)}
                disabled={!chord || hasChecked}
                className={`
                  w-14 h-14 rounded-2xl font-semibold text-base
                  transition-all duration-200 border-2
                  ${chord
                    ? hasChecked
                      ? isCorrectChord
                        ? 'bg-success/20 text-success border-success/50 glow-sm'
                        : 'bg-destructive/20 text-destructive border-destructive/50'
                      : 'bg-primary/20 text-primary border-primary/50 glow-sm cursor-pointer hover:scale-105 active:scale-95'
                    : isWithinProgression
                      ? 'border-dashed border-border/50 text-muted-foreground/40 bg-card/30'
                      : 'border-dashed border-border/30 text-muted-foreground/20 bg-card/10'
                  }
                `}
              >
                {chord || (index + 1)}
              </button>
            );
          })}
        </div>

        {hasChecked && !isCorrect && currentProgression && (
          <div className="pt-3">
            <p className="text-sm text-muted-foreground mb-3">Respuesta correcta:</p>
            <div className="flex gap-3">
              {currentProgression.numerals.map((numeral, index) => (
                <div
                  key={index}
                  className="w-14 h-14 rounded-2xl font-semibold text-base bg-success/10 text-success border-2 border-success/30 flex items-center justify-center"
                >
                  {numeral}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button
          onClick={handleCheck}
          disabled={selectedChords.length === 0 || selectedChords.length > 8 || hasChecked}
          className="gap-2.5 h-11 px-6 rounded-xl"
        >
          <Check className="w-4 h-4" />
          Verificar
        </Button>
        <Button
          variant="outline"
          onClick={handleClear}
          disabled={selectedChords.length === 0}
          className="gap-2.5 h-11 px-6 rounded-xl bg-secondary/50 border-border/50"
        >
          <X className="w-4 h-4" />
          Borrar
        </Button>
      </div>

      {hasChecked && (
        <div className={`p-5 rounded-2xl border ${isCorrect ? 'bg-success/10 border-success/30' : 'bg-destructive/10 border-destructive/30'}`}>
          <p className={`font-semibold ${isCorrect ? 'text-success' : 'text-destructive'}`}>
            {isCorrect ? '¡Correcto!' : 'Incorrecto'}
          </p>
          {currentProgression && (
            <p className="text-sm text-muted-foreground mt-1.5">
              Progresión: {currentProgression.name} en {currentKey}
            </p>
          )}
        </div>
      )}

      <div className="space-y-5">
        <h3 className="text-sm font-medium text-muted-foreground">
          Selecciona los acordes en orden
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Mayores</p>
            <div className="flex flex-wrap gap-2.5">
              {majorChords.map((chord) => (
                <button
                  key={chord}
                  onClick={() => handleChordSelect(chord)}
                  disabled={hasChecked || selectedChords.length >= 8}
                  className="w-14 h-14 rounded-xl font-semibold text-base transition-all duration-150 bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-primary/10 hover:text-primary text-foreground disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                >
                  {chord}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Menores</p>
            <div className="flex flex-wrap gap-2.5">
              {minorChords.map((chord) => (
                <button
                  key={chord}
                  onClick={() => handleChordSelect(chord)}
                  disabled={hasChecked || selectedChords.length >= 8}
                  className="w-14 h-14 rounded-xl font-semibold text-base transition-all duration-150 bg-secondary/30 border border-border/40 hover:border-accent/50 hover:bg-accent/10 hover:text-accent text-foreground disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
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

function RepertoireMode({ genre }: { genre: string }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [currentProgression, setCurrentProgression] = useState<Progression | null>(null);
  const [selectedChords, setSelectedChords] = useState<string[]>([]);
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playerId = 'practice-player';

  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) return;

      if (!document.getElementById('youtube-api')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
    };

    loadYouTubeAPI();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      playerRef.current?.destroy();
    };
  }, []);

  const initPlayer = useCallback((song: Song) => {
    if (!window.YT || !containerRef.current || !song.youtubeId) return;

    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
      setIsPlayerReady(false);
    }

    const existingDiv = document.getElementById(playerId);
    if (existingDiv) existingDiv.remove();

    const playerDiv = document.createElement('div');
    playerDiv.id = playerId;
    containerRef.current.appendChild(playerDiv);

    new window.YT.Player(playerId, {
      videoId: song.youtubeId,
      playerVars: {
        controls: 0,
        disablekb: 1,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        start: Math.floor(song.startTime || 0),
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

  const selectRandomSong = useCallback(async () => {
    const song = await getRandomSongAction(genre);
    if (!song) return;

    setCurrentSong(song as Song);
    setCurrentProgression(song.progression);
    setSelectedChords([]);
    setHasChecked(false);
    setIsCorrect(false);
    setIsPlayerReady(false);

    const checkAndInit = () => {
      if (window.YT && window.YT.Player) {
        initPlayer(song as Song);
      } else {
        setTimeout(checkAndInit, 100);
      }
    };
    checkAndInit();
  }, [genre, initPlayer]);

  useEffect(() => {
    selectRandomSong();
  }, [selectRandomSong]);

  const handlePlay = useCallback(() => {
    if (!currentSong || !playerRef.current || !isPlayerReady) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    } else {
      playerRef.current.seekTo(currentSong.startTime || 0, true);
      playerRef.current.playVideo();

      timerRef.current = setTimeout(() => {
        playerRef.current?.pauseVideo();
        setIsPlaying(false);
      }, (currentSong.duration || 15) * 1000);
    }
  }, [currentSong, isPlaying, isPlayerReady]);

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
    if (selectedChords.length < 8) {
      setSelectedChords([...selectedChords, chord]);
    }
  };

  const handleRemoveChord = (index: number) => {
    if (hasChecked) return;
    setSelectedChords(selectedChords.filter((_, i) => i !== index));
  };

  const handleCheck = () => {
    if (!currentSong || !currentProgression || selectedChords.length === 0) return;

    const correctLength = selectedChords.length === currentProgression.numerals.length;
    const correctChords = correctLength && selectedChords.every(
      (chord, index) => chord.toLowerCase() === currentProgression.numerals[index].toLowerCase()
    );

    setIsCorrect(correctChords);
    setHasChecked(true);
  };

  const handleClear = () => {
    setSelectedChords([]);
    setHasChecked(false);
    setIsCorrect(false);
  };

  const progressionLength = currentProgression?.numerals.length || 4;

  return (
    <div className="space-y-8">
      <div className="p-5 rounded-3xl bg-card/50 border border-border/50">
        <div className="flex items-center gap-5">
          <div
            ref={containerRef}
            className="w-40 aspect-video bg-secondary/30 relative rounded-xl overflow-hidden shrink-0 border border-border/30 [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:absolute [&_iframe]:inset-0"
          >
            {!isPlayerReady && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                ...
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {currentSong ? (
              <>
                <p className="font-semibold text-lg truncate">{currentSong.title}</p>
                <p className="text-sm text-muted-foreground truncate mt-0.5">{currentSong.artist}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {currentSong.key} {currentSong.mode === 'major' ? 'Mayor' : 'menor'}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">Cargando...</p>
            )}
          </div>

          <div className="flex gap-3 shrink-0">
            <Button
              size="lg"
              className="h-12 w-12 p-0 rounded-xl glow"
              onClick={handlePlay}
              disabled={!isPlayerReady}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-12 p-0 rounded-xl bg-secondary/50 border-border/50"
              onClick={handleNext}
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            Tu respuesta ({selectedChords.length}/{progressionLength})
          </h3>
          <p className="text-xs text-muted-foreground/70">
            No todas las casillas deben llenarse
          </p>
        </div>
        <div className="flex gap-3 min-h-[72px] flex-wrap">
          {Array.from({ length: 8 }).map((_, index) => {
            const chord = selectedChords[index];
            const isWithinProgression = index < progressionLength;
            const isCorrectChord = hasChecked && currentProgression &&
              chord?.toLowerCase() === currentProgression.numerals[index]?.toLowerCase();

            return (
              <button
                key={index}
                onClick={() => chord && handleRemoveChord(index)}
                disabled={!chord || hasChecked}
                className={`
                  w-14 h-14 rounded-2xl font-semibold text-base
                  transition-all duration-200 border-2
                  ${chord
                    ? hasChecked
                      ? isCorrectChord
                        ? 'bg-success/20 text-success border-success/50 glow-sm'
                        : 'bg-destructive/20 text-destructive border-destructive/50'
                      : 'bg-primary/20 text-primary border-primary/50 glow-sm cursor-pointer hover:scale-105 active:scale-95'
                    : isWithinProgression
                      ? 'border-dashed border-border/50 text-muted-foreground/40 bg-card/30'
                      : 'border-dashed border-border/30 text-muted-foreground/20 bg-card/10'
                  }
                `}
              >
                {chord || (index + 1)}
              </button>
            );
          })}
        </div>

        {hasChecked && !isCorrect && currentProgression && (
          <div className="pt-3">
            <p className="text-sm text-muted-foreground mb-3">Respuesta correcta:</p>
            <div className="flex gap-3">
              {currentProgression.numerals.map((numeral, index) => (
                <div
                  key={index}
                  className="w-14 h-14 rounded-2xl font-semibold text-base bg-success/10 text-success border-2 border-success/30 flex items-center justify-center"
                >
                  {numeral}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button
          onClick={handleCheck}
          disabled={!currentSong || selectedChords.length === 0 || selectedChords.length > 8 || hasChecked}
          className="gap-2.5 h-11 px-6 rounded-xl"
        >
          <Check className="w-4 h-4" />
          Verificar
        </Button>
        <Button
          variant="outline"
          onClick={handleClear}
          disabled={selectedChords.length === 0}
          className="gap-2.5 h-11 px-6 rounded-xl bg-secondary/50 border-border/50"
        >
          <X className="w-4 h-4" />
          Borrar
        </Button>
      </div>

      {hasChecked && currentSong && (
        <div className={`p-5 rounded-2xl border ${isCorrect ? 'bg-success/10 border-success/30' : 'bg-destructive/10 border-destructive/30'}`}>
          <p className={`font-semibold ${isCorrect ? 'text-success' : 'text-destructive'}`}>
            {isCorrect ? '¡Correcto!' : 'Incorrecto'}
          </p>
          <p className="text-sm text-muted-foreground mt-1.5">
            {currentSong.title} - {currentSong.artist}
          </p>
        </div>
      )}

      <div className="space-y-5">
        <h3 className="text-sm font-medium text-muted-foreground">
          Selecciona los acordes en orden
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Mayores</p>
            <div className="flex flex-wrap gap-2.5">
              {majorChords.map((chord) => (
                <button
                  key={chord}
                  onClick={() => handleChordSelect(chord)}
                  disabled={!currentSong || hasChecked || selectedChords.length >= 8}
                  className="w-14 h-14 rounded-xl font-semibold text-base transition-all duration-150 bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-primary/10 hover:text-primary text-foreground disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                >
                  {chord}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Menores</p>
            <div className="flex flex-wrap gap-2.5">
              {minorChords.map((chord) => (
                <button
                  key={chord}
                  onClick={() => handleChordSelect(chord)}
                  disabled={!currentSong || hasChecked || selectedChords.length >= 8}
                  className="w-14 h-14 rounded-xl font-semibold text-base transition-all duration-150 bg-secondary/30 border border-border/40 hover:border-accent/50 hover:bg-accent/10 hover:text-accent text-foreground disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
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

export default function PracticarPage({
  params,
}: {
  params: Promise<{ genre: string }>;
}) {
  const { genre } = use(params);

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Practicar
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Escucha y selecciona los acordes en orden
        </p>
      </div>

      <Tabs defaultValue="piano" className="space-y-8">
        <TabsList className="inline-flex h-14 p-1.5 bg-card/50 border border-border/50 rounded-2xl">
          <TabsTrigger
            value="piano"
            className="gap-2.5 px-6 py-3 rounded-xl data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:glow-sm"
          >
            <Piano className="w-4 h-4" />
            Acordes Piano
          </TabsTrigger>
          <TabsTrigger
            value="repertoire"
            className="gap-2.5 px-6 py-3 rounded-xl data-[state=active]:bg-accent/15 data-[state=active]:text-accent"
          >
            <Music className="w-4 h-4" />
            Repertorio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="piano">
          <PianoMode genre={genre} />
        </TabsContent>

        <TabsContent value="repertoire">
          <RepertoireMode genre={genre} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
