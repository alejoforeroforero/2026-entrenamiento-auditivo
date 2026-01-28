'use client';

import { useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Volume2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AudioPlayer } from '@/components/audio/audio-player';
import { PianoVisualization } from '@/components/audio/piano-visualization';
import { AnswerOptions } from './answer-options';
import { Feedback } from './feedback';
import { useTone } from '@/hooks/useTone';
import { useExerciseStore } from '@/stores/exercise-store';
import { useProgressStore } from '@/stores/progress-store';
import { ProgressionExercise as ProgressionExerciseType } from '@/types/music';

interface ProgressionExerciseProps {
  exercise: ProgressionExerciseType;
  onComplete?: () => void;
}

export function ProgressionExercise({ exercise, onComplete }: ProgressionExerciseProps) {
  const {
    isReady,
    isPlaying,
    currentBeat,
    tempo,
    initialize,
    playProgression,
    stop,
    setTempo,
  } = useTone();

  const {
    selectedAnswer,
    isAnswered,
    isCorrect,
    submitAnswer,
    nextExercise,
  } = useExerciseStore();

  const recordResult = useProgressStore((state) => state.recordResult);
  const [startTime, setStartTime] = useState<number>(0);

  // Initialize audio on first interaction
  const handleInitialize = useCallback(async () => {
    if (!isReady) {
      await initialize();
    }
  }, [isReady, initialize]);

  // Play the progression
  const handlePlay = useCallback(() => {
    if (!exercise.progression.chords.length) return;
    playProgression(exercise.progression.chords, tempo);
    if (!startTime) {
      setStartTime(Date.now());
    }
  }, [exercise.progression.chords, playProgression, tempo, startTime]);

  // Handle answer submission
  const handleSelectAnswer = useCallback(
    (optionId: string) => {
      const correct = submitAnswer(optionId);
      const responseTime = startTime ? Date.now() - startTime : 0;

      // Record to progress store
      recordResult({
        exerciseId: exercise.id,
        type: 'progression',
        genre: exercise.genre,
        correct,
        responseTime,
      });
    },
    [submitAnswer, recordResult, exercise.id, exercise.genre, startTime]
  );

  // Handle next exercise
  const handleNext = useCallback(() => {
    stop();
    setStartTime(0);
    nextExercise();
    onComplete?.();
  }, [stop, nextExercise, onComplete]);

  // Get correct answer label for feedback
  const correctAnswerLabel = exercise.options.find(
    (o) => o.id === exercise.correctAnswer
  )?.label;

  return (
    <div className="space-y-6" onClick={handleInitialize}>
      {/* Exercise header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Identifica la Progresión</h2>
        </div>
        {exercise.genre && (
          <Badge variant="outline" className="capitalize">
            {exercise.genre}
          </Badge>
        )}
      </div>

      {/* Key info */}
      <div className="text-sm text-muted-foreground">
        Tonalidad: <span className="font-medium">{exercise.progression.key} {exercise.progression.mode === 'minor' ? 'menor' : 'Mayor'}</span>
      </div>

      {/* Audio player */}
      <AudioPlayer
        isPlaying={isPlaying}
        isReady={isReady}
        tempo={tempo}
        onPlay={handlePlay}
        onStop={stop}
        onTempoChange={setTempo}
        onRepeat={handlePlay}
      />

      {/* Piano visualization */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-4"
      >
        <PianoVisualization
          chords={exercise.progression.chords}
          currentChordIndex={isPlaying ? currentBeat : -1}
        />
      </motion.div>

      {/* Instructions */}
      {!isReady && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50">
          <Volume2 className="w-5 h-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Haz clic en cualquier lugar para activar el audio, luego presiona Play
          </p>
        </div>
      )}

      {/* Answer options */}
      <div className="pt-4">
        <h3 className="text-sm font-medium mb-3 text-muted-foreground">
          ¿Qué progresión escuchas?
        </h3>
        <AnswerOptions
          options={exercise.options}
          selectedAnswer={selectedAnswer}
          isAnswered={isAnswered}
          onSelect={handleSelectAnswer}
          disabled={!isReady}
        />
      </div>

      {/* Feedback */}
      <Feedback
        isCorrect={isCorrect}
        correctAnswer={correctAnswerLabel}
        explanation={exercise.progression.progression.description}
        onNext={handleNext}
        show={isAnswered}
      />
    </div>
  );
}
