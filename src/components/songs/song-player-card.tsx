'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Play, Pause, Music } from 'lucide-react';
import { Card, CardBody, Chip } from '@heroui/react';
import { FavoriteButton } from '@/components/favorites/favorite-button';

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

interface Genre {
  id: string;
}

interface Progression {
  id: string;
  name: string;
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

interface SongPlayerCardProps {
  song: Song;
  isFavorited?: boolean;
  progression?: Progression | null;
  genre?: Genre | null;
  showProgression?: boolean;
}

export function SongPlayerCard({
  song,
  isFavorited,
  progression,
  genre,
  showProgression = false,
}: SongPlayerCardProps) {
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const shouldStartTimerRef = useRef(false);
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
            if (shouldStartTimerRef.current) {
              shouldStartTimerRef.current = false;
              if (timerRef.current) clearTimeout(timerRef.current);
              timerRef.current = setTimeout(() => {
                playerRef.current?.pauseVideo();
                setIsPlaying(false);
              }, (song.duration || 15) * 1000);
            }
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
      shouldStartTimerRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    } else {
      shouldStartTimerRef.current = true;
      playerRef.current.seekTo(song.startTime || 0, true);
      playerRef.current.playVideo();
    }
  }, [isPlaying, isPlayerReady, song.startTime]);

  return (
    <Card
      isHoverable
      className="bg-content1/50 border border-divider hover:border-primary/40 transition-all"
    >
      <CardBody className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div
            ref={containerRef}
            className="w-full sm:w-40 md:w-44 aspect-video bg-default-100 relative rounded-xl overflow-hidden shrink-0 [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:absolute [&_iframe]:inset-0 group cursor-pointer"
            onClick={handlePlay}
          >
            <div className="absolute inset-0 z-[5] bg-black/60 pointer-events-none" />
            <button
              className={`absolute inset-0 z-10 flex items-center justify-center transition-all ${
                isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'
              }`}
              disabled={!isPlayerReady}
            >
              <span
                className={`flex items-center justify-center w-14 h-14 rounded-full bg-primary shadow-lg shadow-primary/40 transition-transform ${
                  !isPlaying && 'group-hover:scale-110'
                }`}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-primary-foreground" />
                ) : (
                  <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
                )}
              </span>
            </button>
          </div>

          <div className="flex-1 min-w-0 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{song.title}</p>
              <p className="text-sm text-default-500 truncate mt-0.5">{song.artist}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Chip size="sm" variant="flat" color="default">
                  {song.key} {song.mode === 'major' ? 'Mayor' : 'menor'}
                </Chip>
                {song.startTime !== null && song.duration !== null && (
                  <span className="text-xs text-default-400">
                    {song.startTime}s - {song.startTime + song.duration}s
                  </span>
                )}
              </div>
            </div>

            <FavoriteButton
              songId={song.id}
              initialFavorited={isFavorited}
              className="shrink-0"
            />
          </div>
        </div>

        {showProgression && progression && genre && (
          <Link
            href={`/${genre.id}/progresiones/${progression.id}`}
            className="flex items-center gap-3 mt-3 pt-3 border-t border-divider group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Music className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-default-500">Progresión</p>
              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                {progression.name}
              </p>
            </div>
          </Link>
        )}
      </CardBody>
    </Card>
  );
}
