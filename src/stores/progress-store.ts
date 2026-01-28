'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ExerciseResult, ExerciseType, Genre, UserProgress } from '@/types/music';

interface ProgressState extends UserProgress {
  // Actions
  recordResult: (result: Omit<ExerciseResult, 'timestamp'>) => void;
  resetProgress: () => void;
}

const initialProgress: UserProgress = {
  totalExercises: 0,
  correctAnswers: 0,
  streak: 0,
  bestStreak: 0,
  accuracy: 0,
  exercisesByType: {
    progression: { total: 0, correct: 0 },
    rhythm: { total: 0, correct: 0 },
    'melodic-dictation': { total: 0, correct: 0 },
  },
  exercisesByGenre: {
    cumbia: { total: 0, correct: 0 },
    vallenato: { total: 0, correct: 0 },
    bambuco: { total: 0, correct: 0 },
  },
  recentResults: [],
  lastPracticed: undefined,
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initialProgress,

      recordResult: (result) => {
        const state = get();
        const fullResult: ExerciseResult = {
          ...result,
          timestamp: Date.now(),
        };

        // Update streak
        const newStreak = result.correct ? state.streak + 1 : 0;
        const newBestStreak = Math.max(newStreak, state.bestStreak);

        // Update totals
        const newTotal = state.totalExercises + 1;
        const newCorrect = state.correctAnswers + (result.correct ? 1 : 0);
        const newAccuracy = (newCorrect / newTotal) * 100;

        // Update by type
        const newByType = { ...state.exercisesByType };
        newByType[result.type] = {
          total: newByType[result.type].total + 1,
          correct: newByType[result.type].correct + (result.correct ? 1 : 0),
        };

        // Update by genre
        const newByGenre = { ...state.exercisesByGenre };
        if (result.genre) {
          newByGenre[result.genre] = {
            total: newByGenre[result.genre].total + 1,
            correct: newByGenre[result.genre].correct + (result.correct ? 1 : 0),
          };
        }

        // Keep only last 50 results
        const newRecentResults = [fullResult, ...state.recentResults].slice(0, 50);

        set({
          totalExercises: newTotal,
          correctAnswers: newCorrect,
          streak: newStreak,
          bestStreak: newBestStreak,
          accuracy: newAccuracy,
          exercisesByType: newByType,
          exercisesByGenre: newByGenre,
          recentResults: newRecentResults,
          lastPracticed: Date.now(),
        });
      },

      resetProgress: () => {
        set(initialProgress);
      },
    }),
    {
      name: 'ear-training-progress',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Selectors
export const selectAccuracyByType = (state: ProgressState, type: ExerciseType) => {
  const stats = state.exercisesByType[type];
  return stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
};

export const selectAccuracyByGenre = (state: ProgressState, genre: Genre) => {
  const stats = state.exercisesByGenre[genre];
  return stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
};

export const selectTodaysProgress = (state: ProgressState) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();

  return state.recentResults.filter((r) => r.timestamp >= todayStart);
};
