'use client';

import { create } from 'zustand';
import {
  ExerciseType,
  ExerciseOption,
  ProgressionExercise,
  RhythmExercise,
  RomanNumeral,
} from '@/types/music';
import { buildProgression, getRandomKey } from '@/lib/music/scales';

interface Progression {
  id: string;
  name: string;
  numerals: string[];
  description: string | null;
}

interface ExerciseState {
  currentExercise: ProgressionExercise | RhythmExercise | null;
  selectedAnswer: string | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  exerciseType: ExerciseType;
  selectedGenre: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sessionCorrect: number;
  sessionTotal: number;
  progressions: Progression[];
  setExerciseType: (type: ExerciseType) => void;
  setGenre: (genre: string) => void;
  setDifficulty: (difficulty: 'beginner' | 'intermediate' | 'advanced') => void;
  setProgressions: (progressions: Progression[]) => void;
  generateExercise: () => void;
  submitAnswer: (answerId: string) => boolean;
  nextExercise: () => void;
  resetSession: () => void;
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
  progressions: [],

  setExerciseType: (type) => set({ exerciseType: type }),
  setGenre: (genre) => set({ selectedGenre: genre }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setProgressions: (progressions) => set({ progressions }),

  generateExercise: () => {
    const { progressions } = get();
    if (progressions.length === 0) return;

    const correctProgression = progressions[Math.floor(Math.random() * progressions.length)];
    const key = getRandomKey();
    const mode = correctProgression.numerals[0] === 'i' ? 'minor' : 'major';
    const chords = buildProgression(key, correctProgression.numerals as RomanNumeral[], mode);

    const wrongProgressions = progressions
      .filter(p => p.id !== correctProgression.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

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

    const exercise: ProgressionExercise = {
      id: `prog-${Date.now()}`,
      type: 'progression',
      difficulty: 'beginner',
      options,
      correctAnswer: correctProgression.id,
      progression: {
        progression: {
          id: correctProgression.id,
          name: correctProgression.name,
          numerals: correctProgression.numerals as RomanNumeral[],
          description: correctProgression.description || undefined,
        },
        key,
        mode,
        chords,
      },
    };

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
