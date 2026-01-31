'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Play, Square, Search, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTone } from '@/hooks/useTone';
import { buildProgression, getRandomKey } from '@/lib/music';
import { RomanNumeral } from '@/types/music';

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

interface Song {
  id: string;
  title: string;
  artist: string;
  key: string;
  mode: 'major' | 'minor';
  youtubeId: string | null;
  startTime: number | null;
  duration: number | null;
}

interface Progression {
  id: string;
  name: string;
  numerals: string[];
  description: string | null;
}

function SongCard({ song }: { song: Song }) {
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const playerId = `player-${song.id}`;

  useEffect(() => {
    if (window.YT) {
      initPlayer();
      return;
    }

    if (!document.getElementById('youtube-api')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      initPlayer();
    };

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      playerRef.current?.destroy();
    };
  }, []);

  const initPlayer = () => {
    if (!window.YT || !containerRef.current || !song.youtubeId) return;

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
  };

  const handlePlay = useCallback(() => {
    if (!playerRef.current || !isPlayerReady) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    } else {
      playerRef.current.seekTo(song.startTime || 0, true);
      playerRef.current.playVideo();

      timerRef.current = setTimeout(() => {
        playerRef.current?.pauseVideo();
        setIsPlaying(false);
      }, (song.duration || 15) * 1000);
    }
  }, [isPlaying, isPlayerReady, song.startTime, song.duration]);

  return (
    <div className="overflow-hidden rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-200">
      <div className="flex items-center gap-4 p-4">
        <div
          ref={containerRef}
          className="w-36 aspect-video bg-secondary/30 relative rounded-xl overflow-hidden shrink-0 border border-border/30 [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:absolute [&_iframe]:inset-0"
        >
          {!isPlayerReady && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
              ...
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 py-1">
          <p className="font-semibold text-sm truncate">{song.title}</p>
          <p className="text-sm text-muted-foreground truncate mt-0.5">{song.artist}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-muted-foreground px-2.5 py-1 bg-secondary/50 rounded-lg border border-border/30">
              {song.key} {song.mode === 'major' ? 'Mayor' : 'menor'}
            </span>
            {song.startTime !== null && song.duration !== null && (
              <span className="text-xs text-muted-foreground">
                {song.startTime}s - {song.startTime + song.duration}s
              </span>
            )}
          </div>
        </div>

        <Button
          size="icon"
          variant={isPlaying ? 'secondary' : 'default'}
          onClick={handlePlay}
          disabled={!isPlayerReady}
          className={`shrink-0 h-11 w-11 rounded-xl ${isPlaying ? 'bg-secondary/80' : 'glow'}`}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}

interface ProgressionDetailProps {
  genre: string;
  progression: Progression;
  songs: Song[];
}

export function ProgressionDetail({ genre, progression, songs }: ProgressionDetailProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { initialize, isReady, playProgression, stop, isPlaying } = useTone();

  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return songs;
    const query = searchQuery.toLowerCase();
    return songs.filter(
      (song) =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
    );
  }, [songs, searchQuery]);

  const handlePlay = useCallback(async () => {
    if (!isReady) {
      await initialize();
    }

    if (isPlaying) {
      stop();
      return;
    }

    const key = getRandomKey();
    const mode = progression.numerals[0] === 'i' || progression.numerals[0] === 'iv' ? 'minor' : 'major';
    const chords = buildProgression(key, progression.numerals as RomanNumeral[], mode);
    playProgression(chords, 60);
  }, [progression, isReady, initialize, isPlaying, stop, playProgression]);

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {progression.name}
        </h1>
        {progression.description && (
          <p className="text-muted-foreground mt-2 text-lg">
            {progression.description}
          </p>
        )}
      </div>

      <div className="p-8 rounded-3xl bg-card/50 border border-border/50">
        <div className="flex items-center justify-center">
          <Button
            size="lg"
            className="gap-2.5 h-14 px-8 rounded-xl text-base glow hover:glow transition-all duration-300"
            onClick={handlePlay}
          >
            {isPlaying ? (
              <>
                <Square className="w-5 h-5" />
                Detener
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Escuchar progresión
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar canciones..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11 h-12 rounded-xl bg-card/50 border-border/50 focus:border-primary/50"
        />
      </div>

      <div className="space-y-5">
        <h2 className="text-sm font-medium text-muted-foreground">
          {filteredSongs.length} {filteredSongs.length === 1 ? 'canción' : 'canciones'}
        </h2>

        {filteredSongs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? 'No se encontraron canciones' : 'No hay canciones con esta progresión en este género'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSongs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
