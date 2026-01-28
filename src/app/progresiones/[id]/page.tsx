'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Play, Square, Search, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProgressionStore } from '@/stores/progression-store';
import { useGenreStore } from '@/stores/genre-store';
import { useTone } from '@/hooks/useTone';
import { buildProgression, getRandomKey } from '@/lib/music';
import { RepertoireEntry } from '@/types/admin';

const REPERTOIRE_STORAGE_KEY = 'ea-repertoire';

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

interface SongCardProps {
  song: RepertoireEntry;
  genreLabel: string;
}

function SongCard({ song, genreLabel }: SongCardProps) {
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const playerId = `player-${song.id}`;

  const startTime = song.startTime ?? 0;
  const duration = song.duration ?? 10;

  // Load YouTube API
  useEffect(() => {
    if (window.YT) {
      initPlayer();
      return;
    }

    // Load the API script if not already loaded
    if (!document.getElementById('youtube-api')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Set up callback for when API is ready
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      initPlayer();
    };

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      playerRef.current?.destroy();
    };
  }, []);

  const initPlayer = () => {
    if (!window.YT || !containerRef.current) return;

    // Create container for player if it doesn't exist
    if (!document.getElementById(playerId)) {
      const playerDiv = document.createElement('div');
      playerDiv.id = playerId;
      containerRef.current.appendChild(playerDiv);
    }

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
  };

  const handlePlay = useCallback(() => {
    if (!playerRef.current || !isPlayerReady) return;

    if (isPlaying) {
      // Pause
      playerRef.current.pauseVideo();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    } else {
      // Play from start time
      playerRef.current.seekTo(startTime, true);
      playerRef.current.playVideo();

      // Set timer to pause after duration
      timerRef.current = setTimeout(() => {
        playerRef.current?.pauseVideo();
        setIsPlaying(false);
      }, duration * 1000);
    }
  }, [isPlaying, isPlayerReady, startTime, duration]);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 p-2">
        {/* Small video player */}
        <div
          ref={containerRef}
          className="w-32 h-20 bg-black relative rounded overflow-hidden shrink-0"
        >
          {!isPlayerReady && (
            <div className="absolute inset-0 flex items-center justify-center text-white text-xs">
              ...
            </div>
          )}
        </div>

        {/* Song info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{song.title}</p>
          <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">
              {song.key} {song.mode === 'major' ? 'M' : 'm'}
            </span>
            <span className="text-xs text-muted-foreground">
              {startTime}s-{startTime + duration}s
            </span>
          </div>
        </div>

        {/* Play button */}
        <Button
          size="sm"
          variant={isPlaying ? 'secondary' : 'default'}
          onClick={handlePlay}
          disabled={!isPlayerReady}
          className="shrink-0 h-8 w-8 p-0"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>
      </div>
    </Card>
  );
}

export default function ProgressionPage() {
  const params = useParams();
  const id = params.id as string;

  const { getProgressionById } = useProgressionStore();
  const { genres } = useGenreStore();

  const [mounted, setMounted] = useState(false);
  const [repertoire, setRepertoire] = useState<RepertoireEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { initialize, isReady, playProgression, stop, isPlaying } = useTone();

  // Wait for client-side hydration
  useEffect(() => {
    setMounted(true);
    setRepertoire(loadRepertoireFromStorage());
  }, []);

  const progression = mounted ? getProgressionById(id) : undefined;

  // Filter songs by progression
  const allSongs = useMemo(() => {
    if (!progression) return [];
    const progStr = progression.numerals.join('-');
    return repertoire.filter((entry) => entry.progression.join('-') === progStr);
  }, [progression, repertoire]);

  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return allSongs;
    const query = searchQuery.toLowerCase();
    return allSongs.filter(
      (song) =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
    );
  }, [allSongs, searchQuery]);

  const handlePlay = useCallback(async () => {
    if (!progression) return;

    if (!isReady) {
      await initialize();
    }

    if (isPlaying) {
      stop();
      return;
    }

    const key = getRandomKey();
    const mode = progression.numerals[0] === 'i' || progression.numerals[0] === 'iv' ? 'minor' : 'major';
    const chords = buildProgression(key, progression.numerals, mode);
    playProgression(chords, 60);
  }, [progression, isReady, initialize, isPlaying, stop, playProgression]);

  const getGenreLabel = (genreId: string) => {
    return genres.find((g) => g.id === genreId)?.label || genreId;
  };

  // Show loading while waiting for client-side hydration
  if (!mounted) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!progression) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold tracking-tight mb-4">
            Progresión no encontrada
          </h1>
          <p className="text-muted-foreground mb-6">
            Esta progresión no existe o ha sido eliminada.
          </p>
          <Button asChild>
            <Link href="/progresiones">Volver al catálogo</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {progression.name}
        </h1>
        {progression.description && (
          <p className="text-muted-foreground mt-1">
            {progression.description}
          </p>
        )}
      </div>

      {/* Play progression button */}
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Button
            size="lg"
            className="gap-2"
            onClick={handlePlay}
          >
            {isPlaying ? (
              <>
                <Square className="w-4 h-4" />
                Detener
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Escuchar progresión
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar canciones..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Songs list */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">
          {filteredSongs.length} {filteredSongs.length === 1 ? 'canción' : 'canciones'}
        </h2>

        {filteredSongs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {searchQuery ? 'No se encontraron canciones' : 'No hay canciones con esta progresión'}
          </p>
        ) : (
          <div className="space-y-4">
            {filteredSongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                genreLabel={getGenreLabel(song.genre)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
