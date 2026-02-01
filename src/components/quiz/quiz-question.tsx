'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Trash2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuizProgress } from './quiz-progress';
import { QuizAttempts } from './quiz-attempts';
import { QuizFeedback } from './quiz-feedback';
import { QuizQuestion as QuizQuestionType, QuizMode } from '@/types/quiz';
import { useTone } from '@/hooks/useTone';
import { buildProgression, getRandomKey } from '@/lib/music';
import { RomanNumeral, Chord } from '@/types/music';
import { cn } from '@/lib/utils';

const MAJOR_CHORDS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const MINOR_CHORDS = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii°'];
const MAX_ATTEMPTS = 3;

interface QuizQuestionProps {
  question: QuizQuestionType;
  mode: QuizMode;
  progress: { current: number; total: number; correct: number };
  currentAttempts: number;
  currentAnswer: string[];
  onAnswerChange: (answer: string[]) => void;
  onSubmit: () => { isCorrect: boolean; attemptsRemaining: number };
  onNext: () => void;
}

export function QuizQuestionComponent({
  question,
  mode,
  progress,
  currentAttempts,
  currentAnswer,
  onAnswerChange,
  onSubmit,
  onNext,
}: QuizQuestionProps) {
  const [feedbackState, setFeedbackState] = useState<{
    show: boolean;
    isCorrect: boolean | null;
    attemptsRemaining: number;
  }>({ show: false, isCorrect: null, attemptsRemaining: MAX_ATTEMPTS });

  const [chords, setChords] = useState<Chord[]>([]);
  const [playKey, setPlayKey] = useState<string>('');

  const {
    isReady,
    isPlaying,
    tempo,
    initialize,
    playProgression,
    stop,
  } = useTone();

  useEffect(() => {
    setFeedbackState({ show: false, isCorrect: null, attemptsRemaining: MAX_ATTEMPTS - currentAttempts });
    onAnswerChange([]);

    if (mode === 'piano' && question.numerals.length > 0) {
      const key = getRandomKey();
      const firstNumeral = question.numerals[0];
      const modeType = firstNumeral === 'i' || firstNumeral === 'iv' ? 'minor' : 'major';
      const builtChords = buildProgression(key, question.numerals as RomanNumeral[], modeType);
      setChords(builtChords);
      setPlayKey(key);
    }
  }, [question.id]);

  const handleInitialize = useCallback(async () => {
    if (!isReady) {
      await initialize();
    }
  }, [isReady, initialize]);

  const handlePlay = useCallback(() => {
    if (mode === 'piano' && chords.length > 0) {
      playProgression(chords, tempo);
    }
  }, [mode, chords, playProgression, tempo]);

  const handleAddChord = (chord: string) => {
    if (currentAnswer.length < question.correctAnswer.length && !feedbackState.show) {
      const newAnswer = [...currentAnswer, chord];
      onAnswerChange(newAnswer);

      // Auto-verify when answer is complete
      if (newAnswer.length === question.correctAnswer.length) {
        setTimeout(() => {
          const result = onSubmit();
          setFeedbackState({
            show: true,
            isCorrect: result.isCorrect,
            attemptsRemaining: result.attemptsRemaining,
          });
        }, 300);
      }
    }
  };

  const handleRemoveLastChord = () => {
    onAnswerChange(currentAnswer.slice(0, -1));
  };

  const handleClearAnswer = () => {
    setFeedbackState({ show: false, isCorrect: null, attemptsRemaining: feedbackState.attemptsRemaining });
    onAnswerChange([]);
  };

  const handleNext = () => {
    stop();
    setFeedbackState({ show: false, isCorrect: null, attemptsRemaining: MAX_ATTEMPTS });
    onNext();
  };

  const isAnswerComplete = currentAnswer.length === question.correctAnswer.length;
  const showRetryState = feedbackState.show && !feedbackState.isCorrect && feedbackState.attemptsRemaining > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-3" onClick={handleInitialize}>
      <QuizProgress {...progress} />

      <div className="flex items-center justify-between">
        <QuizAttempts used={currentAttempts} max={MAX_ATTEMPTS} />
        {mode === 'piano' && playKey && (
          <Badge variant="outline">
            Tonalidad: {playKey}
          </Badge>
        )}
      </div>

      {mode === 'piano' ? (
        <PianoPlayer
          isPlaying={isPlaying}
          isReady={isReady}
          onPlay={handlePlay}
          onStop={stop}
        />
      ) : (
        <RepertoirePlayer
          youtubeId={question.songYoutubeId}
          startTime={question.songStartTime}
          duration={question.songDuration}
          title={question.songTitle}
          artist={question.songArtist}
        />
      )}

      {!isReady && mode === 'piano' && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Haz clic en cualquier lugar para activar el audio
          </p>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-xs font-medium text-muted-foreground">
            Tu respuesta ({currentAnswer.length}/{question.correctAnswer.length})
          </h3>
        </div>

        <div className="flex gap-1.5 md:gap-2 min-h-[40px] md:min-h-[48px] flex-wrap">
          {Array.from({ length: 8 }).map((_, index) => {
            const chord = currentAnswer[index];
            const isWithinProgression = index < question.correctAnswer.length;

            return (
              <button
                key={index}
                onClick={() => chord && handleRemoveLastChord()}
                disabled={!chord || feedbackState.show}
                className={cn(
                  'w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm transition-all duration-200 border-2',
                  chord
                    ? 'bg-primary/20 text-primary border-primary/50 cursor-pointer hover:scale-105 active:scale-95'
                    : isWithinProgression
                      ? 'border-dashed border-border/50 text-muted-foreground/40 bg-card/30'
                      : 'border-dashed border-border/30 text-muted-foreground/20 bg-card/10'
                )}
              >
                {chord || (index + 1)}
              </button>
            );
          })}
        </div>

        {showRetryState && (
          <div className="flex items-center gap-3">
            <div className="flex-1 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <p className="text-amber-500 font-medium text-xs">
                Incorrecto. Tienes {feedbackState.attemptsRemaining} intento{feedbackState.attemptsRemaining !== 1 ? 's' : ''} más
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleClearAnswer}
              className="gap-1.5 h-8 px-3 rounded-lg bg-secondary/50 border-border/50 text-xs shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Borrar
            </Button>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-medium text-muted-foreground">
            Selecciona los acordes en orden
          </h3>
          <div className="space-y-2">
            <div>
              <p className="text-[10px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Mayores</p>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {MAJOR_CHORDS.map((chord) => (
                  <button
                    key={chord}
                    onClick={() => handleAddChord(chord)}
                    disabled={feedbackState.show || currentAnswer.length >= 8}
                    className="w-9 h-9 md:w-11 md:h-11 rounded-md md:rounded-lg font-semibold text-xs md:text-sm transition-all duration-150 bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-primary/10 hover:text-primary text-foreground disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                  >
                    {chord}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Menores</p>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {MINOR_CHORDS.map((chord) => (
                  <button
                    key={chord}
                    onClick={() => handleAddChord(chord)}
                    disabled={feedbackState.show || currentAnswer.length >= 8}
                    className="w-9 h-9 md:w-11 md:h-11 rounded-md md:rounded-lg font-semibold text-xs md:text-sm transition-all duration-150 bg-secondary/30 border border-border/40 hover:border-accent/50 hover:bg-accent/10 hover:text-accent text-foreground disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                  >
                    {chord}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {feedbackState.show && (feedbackState.isCorrect || feedbackState.attemptsRemaining === 0) && (
        <QuizFeedback
          isCorrect={feedbackState.isCorrect}
          correctAnswer={question.correctAnswer.join(' → ')}
          attemptsRemaining={feedbackState.attemptsRemaining}
          onRetry={handleClearAnswer}
          onNext={handleNext}
          show={true}
        />
      )}
    </div>
  );
}

interface PianoPlayerProps {
  isPlaying: boolean;
  isReady: boolean;
  onPlay: () => void;
  onStop: () => void;
}

function PianoPlayer({ isPlaying, isReady, onPlay, onStop }: PianoPlayerProps) {
  return (
    <div className="p-3 rounded-xl bg-card/50 border border-border/50">
      <div className="flex items-center justify-center">
        <Button
          size="default"
          className={cn(
            'gap-2 h-10 px-5 rounded-lg',
            !isPlaying && 'glow'
          )}
          onClick={isPlaying ? onStop : onPlay}
          disabled={!isReady}
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
    </div>
  );
}

interface RepertoirePlayerProps {
  youtubeId?: string;
  startTime?: number;
  duration?: number;
  title?: string;
  artist?: string;
}

function RepertoirePlayer({ youtubeId, startTime, duration, title, artist }: RepertoirePlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const shouldStartTimerRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const playerId = `quiz-player-${youtubeId}`;

  useEffect(() => {
    if (!youtubeId) return;

    const initPlayer = () => {
      if (!window.YT || !containerRef.current) return;

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
          start: Math.floor(startTime || 0),
        },
        events: {
          onReady: (event: any) => {
            playerRef.current = event.target;
            setIsPlayerReady(true);
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              if (shouldStartTimerRef.current) {
                shouldStartTimerRef.current = false;
                if (timerRef.current) clearTimeout(timerRef.current);
                timerRef.current = setTimeout(() => {
                  playerRef.current?.pauseVideo();
                  setIsPlaying(false);
                }, (duration || 15) * 1000);
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

    if (window.YT) {
      initPlayer();
    } else if (!document.getElementById('youtube-api')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.();
        initPlayer();
      };
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      playerRef.current?.destroy();
    };
  }, [youtubeId]);

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
      playerRef.current.seekTo(startTime || 0, true);
      playerRef.current.playVideo();
    }
  }, [isPlaying, isPlayerReady, startTime]);

  if (!youtubeId) {
    return (
      <div className="p-3 rounded-xl bg-card/50 border border-border/50 text-center text-muted-foreground text-sm">
        No hay video disponible para esta pregunta
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl bg-card/50 border border-border/50 space-y-2">
      {title && (
        <div className="text-center">
          <p className="font-semibold text-sm">{title}</p>
          {artist && <p className="text-xs text-muted-foreground">{artist}</p>}
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full aspect-video bg-secondary/30 relative rounded-lg overflow-hidden border border-border/30 [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:absolute [&_iframe]:inset-0"
      >
        {!isPlayerReady && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            Cargando...
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <Button
          size="default"
          className={cn('gap-2 h-9 px-4 rounded-lg text-sm', !isPlaying && 'glow')}
          onClick={handlePlay}
          disabled={!isPlayerReady}
        >
          {isPlaying ? (
            <>
              <Square className="w-3.5 h-3.5" />
              Detener
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              Reproducir fragmento
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

