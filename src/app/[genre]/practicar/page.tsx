'use client';

import { useState, useCallback, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { Play, RotateCcw, SkipForward, Check, X, Piano, Music, Pause, Trophy } from 'lucide-react';
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
    if (selectedChords.length < progressionLength) {
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
    <div className="space-y-2 md:space-y-6">
      <div className="flex items-center justify-center gap-2 md:gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 md:h-10 md:w-10 rounded-lg bg-secondary/50 border-border/50 hover:bg-secondary hover:border-border"
          onClick={handleReplay}
          disabled={chords.length === 0}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          className="gap-1.5 h-9 md:h-10 px-4 md:px-6 rounded-lg text-sm glow hover:glow transition-all duration-300"
          onClick={handlePlay}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? 'Detener' : 'Reproducir'}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 md:h-10 md:w-10 rounded-lg bg-secondary/50 border-border/50 hover:bg-secondary hover:border-border"
          onClick={handleNext}
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-1.5 md:space-y-3">
        <h3 className="text-xs font-medium text-muted-foreground">
          Selecciona los acordes en orden
        </h3>
        <div className="space-y-1.5 md:space-y-3">
          <div>
            <p className="text-[10px] font-medium text-muted-foreground mb-1 md:mb-2 uppercase tracking-wide">Mayores</p>
            <div className="flex flex-wrap gap-1 md:gap-2">
              {majorChords.map((chord) => (
                <button
                  key={chord}
                  onClick={() => handleChordSelect(chord)}
                  disabled={hasChecked || selectedChords.length >= progressionLength}
                  className="w-9 h-9 md:w-11 md:h-11 rounded-lg font-semibold text-sm transition-all duration-150 bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-primary/10 hover:text-primary text-foreground disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                >
                  {chord}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-medium text-muted-foreground mb-1 md:mb-2 uppercase tracking-wide">Menores</p>
            <div className="flex flex-wrap gap-1 md:gap-2">
              {minorChords.map((chord) => (
                <button
                  key={chord}
                  onClick={() => handleChordSelect(chord)}
                  disabled={hasChecked || selectedChords.length >= progressionLength}
                  className="w-9 h-9 md:w-11 md:h-11 rounded-lg font-semibold text-sm transition-all duration-150 bg-secondary/30 border border-border/40 hover:border-accent/50 hover:bg-accent/10 hover:text-accent text-foreground disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                >
                  {chord}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 md:space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-medium text-muted-foreground">
            Tu respuesta ({selectedChords.length}/{progressionLength})
          </h3>
          <div className="flex gap-1.5">
            <Button
              size="sm"
              onClick={handleCheck}
              disabled={selectedChords.length !== progressionLength || hasChecked}
              className="gap-1 h-7 px-2.5 rounded-md text-xs"
            >
              <Check className="w-3 h-3" />
              Verificar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleClear}
              disabled={selectedChords.length === 0}
              className="gap-1 h-7 px-2.5 rounded-md bg-secondary/50 border-border/50 text-xs"
            >
              <X className="w-3 h-3" />
              Borrar
            </Button>
          </div>
        </div>
        <div className="flex gap-1 md:gap-2 flex-wrap">
          {Array.from({ length: progressionLength }).map((_, index) => {
            const chord = selectedChords[index];
            const isCorrectChord = hasChecked && currentProgression &&
              chord?.toLowerCase() === currentProgression.numerals[index]?.toLowerCase();

            return (
              <button
                key={index}
                onClick={() => chord && handleRemoveChord(index)}
                disabled={!chord || hasChecked}
                className={`
                  w-9 h-9 md:w-11 md:h-11 rounded-lg font-semibold text-sm
                  transition-all duration-200 border-2
                  ${chord
                    ? hasChecked
                      ? isCorrectChord
                        ? 'bg-success/20 text-success border-success/50 glow-sm'
                        : 'bg-destructive/20 text-destructive border-destructive/50'
                      : 'bg-primary/20 text-primary border-primary/50 glow-sm cursor-pointer hover:scale-105 active:scale-95'
                    : 'border-dashed border-border/50 text-muted-foreground/40 bg-card/30'
                  }
                `}
              >
                {chord || (index + 1)}
              </button>
            );
          })}
        </div>

        {hasChecked && (
          <div className={`p-2.5 md:p-4 rounded-lg border ${isCorrect ? 'bg-success/10 border-success/30' : 'bg-destructive/10 border-destructive/30'}`}>
            <div className="flex items-center justify-between">
              <p className={`font-semibold text-sm ${isCorrect ? 'text-success' : 'text-destructive'}`}>
                {isCorrect ? '¡Correcto!' : 'Incorrecto'}
              </p>
              {currentProgression && (
                <p className="text-xs text-muted-foreground">
                  {currentProgression.name} en {currentKey}
                </p>
              )}
            </div>
            {!isCorrect && currentProgression && (
              <div className="flex gap-1 md:gap-2 flex-wrap mt-2">
                {currentProgression.numerals.map((numeral, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-lg font-semibold text-xs bg-success/10 text-success border border-success/30 flex items-center justify-center"
                  >
                    {numeral}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
    if (selectedChords.length < progressionLength) {
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
    <div className="space-y-2 md:space-y-6">
      <div className="p-2.5 md:p-4 rounded-xl bg-card/50 border border-border/50">
        <div className="flex items-center gap-2.5">
          <div
            ref={containerRef}
            className="w-20 md:w-32 aspect-video bg-secondary/30 relative rounded-lg overflow-hidden shrink-0 border border-border/30 [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:absolute [&_iframe]:inset-0"
          >
            {!isPlayerReady && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
                ...
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {currentSong ? (
              <>
                <p className="font-semibold text-sm truncate">{currentSong.title}</p>
                <p className="text-xs text-muted-foreground truncate">{currentSong.artist}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {currentSong.key} {currentSong.mode === 'major' ? 'Mayor' : 'menor'}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">Cargando...</p>
            )}
          </div>

          <div className="flex gap-1.5 shrink-0">
            <Button
              size="icon"
              className="h-9 w-9 md:h-10 md:w-10 rounded-lg glow"
              onClick={handlePlay}
              disabled={!isPlayerReady}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-9 w-9 md:h-10 md:w-10 rounded-lg bg-secondary/50 border-border/50"
              onClick={handleNext}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 md:space-y-3">
        <h3 className="text-xs font-medium text-muted-foreground">
          Selecciona los acordes en orden
        </h3>
        <div className="space-y-1.5 md:space-y-3">
          <div>
            <p className="text-[10px] font-medium text-muted-foreground mb-1 md:mb-2 uppercase tracking-wide">Mayores</p>
            <div className="flex flex-wrap gap-1 md:gap-2">
              {majorChords.map((chord) => (
                <button
                  key={chord}
                  onClick={() => handleChordSelect(chord)}
                  disabled={!currentSong || hasChecked || selectedChords.length >= progressionLength}
                  className="w-9 h-9 md:w-11 md:h-11 rounded-lg font-semibold text-sm transition-all duration-150 bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-primary/10 hover:text-primary text-foreground disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                >
                  {chord}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-medium text-muted-foreground mb-1 md:mb-2 uppercase tracking-wide">Menores</p>
            <div className="flex flex-wrap gap-1 md:gap-2">
              {minorChords.map((chord) => (
                <button
                  key={chord}
                  onClick={() => handleChordSelect(chord)}
                  disabled={!currentSong || hasChecked || selectedChords.length >= progressionLength}
                  className="w-9 h-9 md:w-11 md:h-11 rounded-lg font-semibold text-sm transition-all duration-150 bg-secondary/30 border border-border/40 hover:border-accent/50 hover:bg-accent/10 hover:text-accent text-foreground disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                >
                  {chord}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 md:space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-medium text-muted-foreground">
            Tu respuesta ({selectedChords.length}/{progressionLength})
          </h3>
          <div className="flex gap-1.5">
            <Button
              size="sm"
              onClick={handleCheck}
              disabled={!currentSong || selectedChords.length !== progressionLength || hasChecked}
              className="gap-1 h-7 px-2.5 rounded-md text-xs"
            >
              <Check className="w-3 h-3" />
              Verificar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleClear}
              disabled={selectedChords.length === 0}
              className="gap-1 h-7 px-2.5 rounded-md bg-secondary/50 border-border/50 text-xs"
            >
              <X className="w-3 h-3" />
              Borrar
            </Button>
          </div>
        </div>
        <div className="flex gap-1 md:gap-2 flex-wrap">
          {Array.from({ length: progressionLength }).map((_, index) => {
            const chord = selectedChords[index];
            const isCorrectChord = hasChecked && currentProgression &&
              chord?.toLowerCase() === currentProgression.numerals[index]?.toLowerCase();

            return (
              <button
                key={index}
                onClick={() => chord && handleRemoveChord(index)}
                disabled={!chord || hasChecked}
                className={`
                  w-9 h-9 md:w-11 md:h-11 rounded-lg font-semibold text-sm
                  transition-all duration-200 border-2
                  ${chord
                    ? hasChecked
                      ? isCorrectChord
                        ? 'bg-success/20 text-success border-success/50 glow-sm'
                        : 'bg-destructive/20 text-destructive border-destructive/50'
                      : 'bg-primary/20 text-primary border-primary/50 glow-sm cursor-pointer hover:scale-105 active:scale-95'
                    : 'border-dashed border-border/50 text-muted-foreground/40 bg-card/30'
                  }
                `}
              >
                {chord || (index + 1)}
              </button>
            );
          })}
        </div>

        {hasChecked && (
          <div className={`p-2.5 md:p-4 rounded-lg border ${isCorrect ? 'bg-success/10 border-success/30' : 'bg-destructive/10 border-destructive/30'}`}>
            <div className="flex items-center justify-between">
              <p className={`font-semibold text-sm ${isCorrect ? 'text-success' : 'text-destructive'}`}>
                {isCorrect ? '¡Correcto!' : 'Incorrecto'}
              </p>
              {currentSong && (
                <p className="text-xs text-muted-foreground truncate ml-2">
                  {currentSong.title}
                </p>
              )}
            </div>
            {!isCorrect && currentProgression && (
              <div className="flex gap-1 md:gap-2 flex-wrap mt-2">
                {currentProgression.numerals.map((numeral, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-lg font-semibold text-xs bg-success/10 text-success border border-success/30 flex items-center justify-center"
                  >
                    {numeral}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
  const router = useRouter();

  const handleQuizClick = () => {
    router.push(`/${genre}/quiz`);
  };

  return (
    <div className="max-w-2xl space-y-4 md:space-y-10">
      <div className="hidden md:block">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Practicar
        </h1>
        <p className="text-muted-foreground mt-1.5 md:mt-2 text-base md:text-lg">
          Escucha y selecciona los acordes en orden
        </p>
      </div>

      <Tabs defaultValue="piano" className="space-y-4 md:space-y-8">
        <TabsList className="inline-flex h-10 md:h-14 p-1 md:p-1.5 bg-card/50 border border-border/50 rounded-xl md:rounded-2xl w-full sm:w-auto">
          <TabsTrigger
            value="piano"
            className="flex-1 sm:flex-none gap-1.5 md:gap-2.5 px-3 md:px-6 py-1.5 md:py-3 rounded-lg md:rounded-xl data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:glow-sm text-sm md:text-base"
          >
            <Piano className="w-4 h-4" />
            Piano
          </TabsTrigger>
          <TabsTrigger
            value="repertoire"
            className="flex-1 sm:flex-none gap-1.5 md:gap-2.5 px-3 md:px-6 py-1.5 md:py-3 rounded-lg md:rounded-xl data-[state=active]:bg-accent/15 data-[state=active]:text-accent text-sm md:text-base"
          >
            <Music className="w-4 h-4" />
            Repertorio
          </TabsTrigger>
          <button
            onClick={handleQuizClick}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 md:gap-2.5 px-3 md:px-6 py-1.5 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
          >
            <Trophy className="w-4 h-4" />
            Quiz
          </button>
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
