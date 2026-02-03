'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

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

interface YouTubePlayerProps {
  youtubeId: string;
  startTime?: number;
  duration?: number;
  title: string;
  artist?: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  className?: string;
}

export function YouTubePlayer({
  youtubeId,
  startTime = 0,
  duration = 15,
  title,
  artist,
  subtitle,
  rightContent,
  className = '',
}: YouTubePlayerProps) {
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const shouldStartTimerRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const playerId = `player-${youtubeId}`;

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
    if (!window.YT || !containerRef.current || !youtubeId) return;

    if (!document.getElementById(playerId)) {
      const playerDiv = document.createElement('div');
      playerDiv.id = playerId;
      containerRef.current.appendChild(playerDiv);
    }

    new window.YT.Player(playerId, {
      videoId: youtubeId,
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
            if (shouldStartTimerRef.current) {
              shouldStartTimerRef.current = false;
              if (timerRef.current) clearTimeout(timerRef.current);
              timerRef.current = setTimeout(() => {
                playerRef.current?.pauseVideo();
                setIsPlaying(false);
              }, duration * 1000);
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
      playerRef.current.seekTo(startTime, true);
      playerRef.current.playVideo();
    }
  }, [isPlaying, isPlayerReady, startTime]);

  return (
    <div className={`p-3 sm:p-4 rounded-xl bg-card/50 border border-border/50 ${className}`}>
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          ref={containerRef}
          className="w-28 sm:w-40 md:w-44 aspect-video bg-default-100 relative rounded-xl overflow-hidden shrink-0 [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:absolute [&_iframe]:inset-0 group cursor-pointer"
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
              className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary shadow-lg shadow-primary/40 transition-transform ${
                !isPlaying && 'group-hover:scale-110'
              }`}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              ) : (
                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground ml-0.5" />
              )}
            </span>
          </button>
        </div>

        <div className="flex-1 min-w-0 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm sm:text-base truncate">{title}</p>
            {artist && (
              <p className="text-sm text-default-500 truncate mt-0.5">{artist}</p>
            )}
            {subtitle && (
              <p className="text-xs text-default-400 mt-1">{subtitle}</p>
            )}
          </div>

          {rightContent}
        </div>
      </div>
    </div>
  );
}
