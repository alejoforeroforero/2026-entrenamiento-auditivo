'use client';

import { useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Drum, Volume2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AudioPlayer } from '@/components/audio/audio-player';
import { RhythmGrid } from '@/components/audio/rhythm-grid';
import { AnswerOptions } from './answer-options';
import { Feedback } from './feedback';
import { useTone } from '@/hooks/useTone';
import { useExerciseStore } from '@/stores/exercise-store';
import { useProgressStore } from '@/stores/progress-store';
import { RhythmExercise as RhythmExerciseType } from '@/types/music';

interface RhythmExerciseProps {
  exercise: RhythmExerciseType;
  onComplete?: () => void;
}

export function RhythmExercise({ exercise, onComplete }: RhythmExerciseProps) {
  const {
    isReady,
    isPlaying,
    currentBeat,
    tempo,
    initialize,
    playRhythm,
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

  // Play the rhythm
  const handlePlay = useCallback(() => {
    playRhythm(exercise.pattern, 2);
    if (!startTime) {
      setStartTime(Date.now());
    }
  }, [exercise.pattern, playRhythm, startTime]);

  // Handle answer submission
  const handleSelectAnswer = useCallback(
    (optionId: string) => {
      const correct = submitAnswer(optionId);
      const responseTime = startTime ? Date.now() - startTime : 0;

      // Record to progress store
      recordResult({
        exerciseId: exercise.id,
        type: 'rhythm',
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
          <Drum className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Identifica el Ritmo</h2>
        </div>
        {exercise.genre && (
          <Badge variant="outline" className="capitalize">
            {exercise.genre}
          </Badge>
        )}
      </div>

      {/* Audio player */}
      <AudioPlayer
        isPlaying={isPlaying}
        isReady={isReady}
        tempo={exercise.pattern.bpm}
        onPlay={handlePlay}
        onStop={stop}
        onTempoChange={setTempo}
        onRepeat={handlePlay}
      />

      {/* Rhythm visualization */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-4"
      >
        <RhythmGrid
          pattern={exercise.pattern}
          currentStep={currentBeat}
          isPlaying={isPlaying}
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
          ¿Qué ritmo escuchas?
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
        explanation={exercise.pattern.description}
        onNext={handleNext}
        show={isAnswered}
      />
    </div>
  );
}
