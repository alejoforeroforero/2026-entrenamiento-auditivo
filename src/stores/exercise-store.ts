'use client';

import { create } from 'zustand';
import {
  Genre,
  ExerciseType,
  ExerciseOption,
  ProgressionExercise,
  RhythmExercise,
  Progression,
  RhythmPattern,
  NoteName,
} from '@/types/music';
import { buildProgression, getRandomKey } from '@/lib/music/scales';
import { progressions, getProgressionsByGenre, getRandomProgression } from '@/data/progressions';
import { rhythmPatterns, getRhythmsByGenre, getRandomRhythm } from '@/data/rhythms';

interface ExerciseState {
  // Current exercise state
  currentExercise: ProgressionExercise | RhythmExercise | null;
  selectedAnswer: string | null;
  isAnswered: boolean;
  isCorrect: boolean | null;

  // Settings
  exerciseType: ExerciseType;
  selectedGenre: Genre | 'all';
  difficulty: 'beginner' | 'intermediate' | 'advanced';

  // Session stats
  sessionCorrect: number;
  sessionTotal: number;

  // Actions
  setExerciseType: (type: ExerciseType) => void;
  setGenre: (genre: Genre | 'all') => void;
  setDifficulty: (difficulty: 'beginner' | 'intermediate' | 'advanced') => void;
  generateExercise: () => void;
  submitAnswer: (answerId: string) => boolean;
  nextExercise: () => void;
  resetSession: () => void;
}

function generateProgressionExercise(genre: Genre | 'all'): ProgressionExercise {
  // Get correct progression
  const correctProgression = genre === 'all'
    ? getRandomProgression()
    : getRandomProgression(genre);

  // Get random key
  const key = getRandomKey();
  const mode = correctProgression.numerals[0] === 'i' ? 'minor' : 'major';

  // Build chords for the correct answer
  const chords = buildProgression(key, correctProgression.numerals, mode);

  // Generate wrong options (other progressions from the same or different genres)
  const allProgressions = genre === 'all'
    ? progressions
    : [...getProgressionsByGenre(genre as Genre), ...progressions.filter(p => p.genre !== genre).slice(0, 4)];

  const wrongProgressions = allProgressions
    .filter(p => p.id !== correctProgression.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  // Create options array
  const options: ExerciseOption[] = [
    {
      id: correctProgression.id,
      label: correctProgression.name,
      value: correctProgression.id,
      correct: true,
    },
    ...wrongProgressions.map(p => ({
      id: p.id,
      label: p.name,
      value: p.id,
      correct: false,
    })),
  ].sort(() => Math.random() - 0.5);

  return {
    id: `prog-${Date.now()}`,
    type: 'progression',
    genre: correctProgression.genre,
    difficulty: 'beginner',
    options,
    correctAnswer: correctProgression.id,
    progression: {
      progression: correctProgression,
      key,
      mode,
      chords,
    },
  };
}

function generateRhythmExercise(genre: Genre | 'all'): RhythmExercise {
  // Get correct rhythm pattern
  const correctPattern = genre === 'all'
    ? getRandomRhythm()
    : getRandomRhythm(genre);

  // Generate wrong options
  const allPatterns = genre === 'all'
    ? rhythmPatterns
    : [...getRhythmsByGenre(genre as Genre), ...rhythmPatterns.filter(r => r.genre !== genre).slice(0, 4)];

  const wrongPatterns = allPatterns
    .filter(p => p.id !== correctPattern.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const options: ExerciseOption[] = [
    {
      id: correctPattern.id,
      label: correctPattern.name,
      value: correctPattern.id,
      correct: true,
    },
    ...wrongPatterns.map(p => ({
      id: p.id,
      label: p.name,
      value: p.id,
      correct: false,
    })),
  ].sort(() => Math.random() - 0.5);

  return {
    id: `rhythm-${Date.now()}`,
    type: 'rhythm',
    genre: correctPattern.genre,
    difficulty: 'beginner',
    options,
    correctAnswer: correctPattern.id,
    pattern: correctPattern,
  };
}

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  currentExercise: null,
  selectedAnswer: null,
  isAnswered: false,
  isCorrect: null,

  exerciseType: 'progression',
  selectedGenre: 'all',
  difficulty: 'beginner',

  sessionCorrect: 0,
  sessionTotal: 0,

  setExerciseType: (type) => set({ exerciseType: type }),

  setGenre: (genre) => set({ selectedGenre: genre }),

  setDifficulty: (difficulty) => set({ difficulty }),

  generateExercise: () => {
    const { exerciseType, selectedGenre } = get();

    let exercise: ProgressionExercise | RhythmExercise;

    if (exerciseType === 'progression') {
      exercise = generateProgressionExercise(selectedGenre);
    } else {
      exercise = generateRhythmExercise(selectedGenre);
    }

    set({
      currentExercise: exercise,
      selectedAnswer: null,
      isAnswered: false,
      isCorrect: null,
    });
  },

  submitAnswer: (answerId) => {
    const { currentExercise, sessionCorrect, sessionTotal } = get();
    if (!currentExercise) return false;

    const isCorrect = answerId === currentExercise.correctAnswer;

    set({
      selectedAnswer: answerId,
      isAnswered: true,
      isCorrect,
      sessionCorrect: isCorrect ? sessionCorrect + 1 : sessionCorrect,
      sessionTotal: sessionTotal + 1,
    });

    return isCorrect;
  },

  nextExercise: () => {
    get().generateExercise();
  },

  resetSession: () => {
    set({
      currentExercise: null,
      selectedAnswer: null,
      isAnswered: false,
      isCorrect: null,
      sessionCorrect: 0,
      sessionTotal: 0,
    });
  },
}));
