import { act } from '@testing-library/react';
import { useProgressStore, selectAccuracyByType, selectAccuracyByGenre, selectTodaysProgress } from '../progress-store';

describe('progress-store', () => {
  beforeEach(() => {
    act(() => {
      useProgressStore.getState().resetProgress();
    });
    localStorage.clear();
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useProgressStore.getState();

      expect(state.totalExercises).toBe(0);
      expect(state.correctAnswers).toBe(0);
      expect(state.streak).toBe(0);
      expect(state.bestStreak).toBe(0);
      expect(state.accuracy).toBe(0);
      expect(state.recentResults).toEqual([]);
      expect(state.lastPracticed).toBeUndefined();
    });

    it('should have initialized exercisesByType', () => {
      const state = useProgressStore.getState();

      expect(state.exercisesByType).toEqual({
        progression: { total: 0, correct: 0 },
        rhythm: { total: 0, correct: 0 },
        'melodic-dictation': { total: 0, correct: 0 },
      });
    });

    it('should have initialized exercisesByGenre', () => {
      const state = useProgressStore.getState();

      expect(state.exercisesByGenre).toEqual({
        salsa: { total: 0, correct: 0 },
        cumbia: { total: 0, correct: 0 },
        vallenato: { total: 0, correct: 0 },
        bambuco: { total: 0, correct: 0 },
      });
    });
  });

  describe('recordResult', () => {
    it('should increment totalExercises on any result', () => {
      act(() => {
        useProgressStore.getState().recordResult({
          exerciseId: 'ex-1',
          type: 'progression',
          correct: true,
          responseTime: 1000,
        });
      });

      expect(useProgressStore.getState().totalExercises).toBe(1);
    });

    it('should increment correctAnswers on correct result', () => {
      act(() => {
        useProgressStore.getState().recordResult({
          exerciseId: 'ex-1',
          type: 'progression',
          correct: true,
          responseTime: 1000,
        });
      });

      expect(useProgressStore.getState().correctAnswers).toBe(1);
    });

    it('should not increment correctAnswers on incorrect result', () => {
      act(() => {
        useProgressStore.getState().recordResult({
          exerciseId: 'ex-1',
          type: 'progression',
          correct: false,
          responseTime: 1000,
        });
      });

      expect(useProgressStore.getState().correctAnswers).toBe(0);
    });

    it('should calculate accuracy correctly', () => {
      act(() => {
        useProgressStore.getState().recordResult({
          exerciseId: 'ex-1',
          type: 'progression',
          correct: true,
          responseTime: 1000,
        });
        useProgressStore.getState().recordResult({
          exerciseId: 'ex-2',
          type: 'progression',
          correct: false,
          responseTime: 1000,
        });
      });

      expect(useProgressStore.getState().accuracy).toBe(50);
    });

    it('should update streak on correct answers', () => {
      act(() => {
        useProgressStore.getState().recordResult({
          exerciseId: 'ex-1',
          type: 'progression',
          correct: true,
          responseTime: 1000,
        });
        useProgressStore.getState().recordResult({
          exerciseId: 'ex-2',
          type: 'progression',
          correct: true,
          responseTime: 1000,
        });
      });

      expect(useProgressStore.getState().streak).toBe(2);
    });

    it('should reset streak on incorrect answer', () => {
      act(() => {
        useProgressStore.getState().recordResult({
          exerciseId: 'ex-1',
          type: 'progression',
          correct: true,
          responseTime: 1000,
        });
        useProgressStore.getState().recordResult({
          exerciseId: 'ex-2',
          type: 'progression',
          correct: true,
          responseTime: 1000,
        });
        useProgressStore.getState().recordResult({
          exerciseId: 'ex-3',
          type: 'progression',
          correct: false,
          responseTime: 1000,
        });
      });

      expect(useProgressStore.getState().streak).toBe(0);
    });

    it('should track bestStreak', () => {
      act(() => {
        useProgressStore.getState().recordResult({
          exerciseId: 'ex-1',
          type: 'progression',
          correct: true,
          responseTime: 1000,
        });
        useProgressStore.getState().recordResult({
          exerciseId: 'ex-2',
          type: 'progression',
          correct: true,
          responseTime: 1000,
        });
        useProgressStore.getState().recordResult({
          exerciseId: 'ex-3',
          type: 'progression',
          correct: true,
          responseTime: 1000,
        });
        useProgressStore.getState().recordResult({
          exerciseId: 'ex-4',
          type: 'progression',
          correct: false,
          responseTime: 1000,
        });
      });

      expect(useProgressStore.getState().bestStreak).toBe(3);
      expect(useProgressStore.getState().streak).toBe(0);
    });

    it('should update exercisesByType', () => {
      act(() => {
        useProgressStore.getState().recordResult({
          exerciseId: 'ex-1',
          type: 'progression',
          correct: true,
          responseTime: 1000,
        });
        useProgressStore.getState().recordResult({
          exerciseId: 'ex-2',
          type: 'rhythm',
          correct: false,
          responseTime: 1000,
        });
      });

      const state = useProgressStore.getState();
      expect(state.exercisesByType.progression).toEqual({ total: 1, correct: 1 });
      expect(state.exercisesByType.rhythm).toEqual({ total: 1, correct: 0 });
      expect(state.exercisesByType['melodic-dictation']).toEqual({ total: 0, correct: 0 });
    });

    it('should update exercisesByGenre when genre is provided', () => {
      act(() => {
        useProgressStore.getState().recordResult({
          exerciseId: 'ex-1',
          type: 'progression',
          genre: 'salsa',
          correct: true,
          responseTime: 1000,
        });
        useProgressStore.getState().recordResult({
          exerciseId: 'ex-2',
          type: 'progression',
          genre: 'cumbia',
          correct: false,
          responseTime: 1000,
        });
      });

      const state = useProgressStore.getState();
      expect(state.exercisesByGenre.salsa).toEqual({ total: 1, correct: 1 });
      expect(state.exercisesByGenre.cumbia).toEqual({ total: 1, correct: 0 });
    });

    it('should not update exercisesByGenre when genre is not provided', () => {
      act(() => {
        useProgressStore.getState().recordResult({
          exerciseId: 'ex-1',
          type: 'progression',
          correct: true,
          responseTime: 1000,
        });
      });

      const state = useProgressStore.getState();
      expect(state.exercisesByGenre.salsa).toEqual({ total: 0, correct: 0 });
      expect(state.exercisesByGenre.cumbia).toEqual({ total: 0, correct: 0 });
    });

    it('should add result to recentResults with timestamp', () => {
      const beforeTime = Date.now();

      act(() => {
        useProgressStore.getState().recordResult({
          exerciseId: 'ex-1',
          type: 'progression',
          correct: true,
          responseTime: 1000,
        });
      });

      const afterTime = Date.now();
      const state = useProgressStore.getState();

      expect(state.recentResults).toHaveLength(1);
      expect(state.recentResults[0].exerciseId).toBe('ex-1');
      expect(state.recentResults[0].timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(state.recentResults[0].timestamp).toBeLessThanOrEqual(afterTime);
    });

    it('should keep only last 50 results', () => {
      act(() => {
        for (let i = 0; i < 55; i++) {
          useProgressStore.getState().recordResult({
            exerciseId: `ex-${i}`,
            type: 'progression',
            correct: true,
            responseTime: 1000,
          });
        }
      });

      const state = useProgressStore.getState();
      expect(state.recentResults).toHaveLength(50);
      expect(state.recentResults[0].exerciseId).toBe('ex-54');
      expect(state.recentResults[49].exerciseId).toBe('ex-5');
    });

    it('should update lastPracticed timestamp', () => {
      const beforeTime = Date.now();

      act(() => {
        useProgressStore.getState().recordResult({
          exerciseId: 'ex-1',
          type: 'progression',
          correct: true,
          responseTime: 1000,
        });
      });

      const afterTime = Date.now();
      const state = useProgressStore.getState();

      expect(state.lastPracticed).toBeGreaterThanOrEqual(beforeTime);
      expect(state.lastPracticed).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('resetProgress', () => {
    it('should reset all state to initial values', () => {
      act(() => {
        useProgressStore.getState().recordResult({
          exerciseId: 'ex-1',
          type: 'progression',
          genre: 'salsa',
          correct: true,
          responseTime: 1000,
        });
        useProgressStore.getState().resetProgress();
      });

      const state = useProgressStore.getState();
      expect(state.totalExercises).toBe(0);
      expect(state.correctAnswers).toBe(0);
      expect(state.streak).toBe(0);
      expect(state.bestStreak).toBe(0);
      expect(state.accuracy).toBe(0);
      expect(state.recentResults).toEqual([]);
      expect(state.lastPracticed).toBeUndefined();
    });
  });

  describe('selectors', () => {
    describe('selectAccuracyByType', () => {
      it('should return 0 when no exercises of type', () => {
        const state = useProgressStore.getState();
        expect(selectAccuracyByType(state, 'progression')).toBe(0);
      });

      it('should calculate accuracy correctly', () => {
        act(() => {
          useProgressStore.getState().recordResult({
            exerciseId: 'ex-1',
            type: 'progression',
            correct: true,
            responseTime: 1000,
          });
          useProgressStore.getState().recordResult({
            exerciseId: 'ex-2',
            type: 'progression',
            correct: true,
            responseTime: 1000,
          });
          useProgressStore.getState().recordResult({
            exerciseId: 'ex-3',
            type: 'progression',
            correct: false,
            responseTime: 1000,
          });
        });

        const state = useProgressStore.getState();
        const accuracy = selectAccuracyByType(state, 'progression');
        expect(accuracy).toBeCloseTo(66.67, 1);
      });
    });

    describe('selectAccuracyByGenre', () => {
      it('should return 0 when no exercises of genre', () => {
        const state = useProgressStore.getState();
        expect(selectAccuracyByGenre(state, 'salsa')).toBe(0);
      });

      it('should calculate accuracy correctly', () => {
        act(() => {
          useProgressStore.getState().recordResult({
            exerciseId: 'ex-1',
            type: 'progression',
            genre: 'salsa',
            correct: true,
            responseTime: 1000,
          });
          useProgressStore.getState().recordResult({
            exerciseId: 'ex-2',
            type: 'progression',
            genre: 'salsa',
            correct: false,
            responseTime: 1000,
          });
        });

        const state = useProgressStore.getState();
        expect(selectAccuracyByGenre(state, 'salsa')).toBe(50);
      });
    });

    describe('selectTodaysProgress', () => {
      it('should return empty array when no results', () => {
        const state = useProgressStore.getState();
        expect(selectTodaysProgress(state)).toEqual([]);
      });

      it('should return only today\'s results', () => {
        const now = Date.now();
        const yesterday = now - 24 * 60 * 60 * 1000;

        act(() => {
          useProgressStore.getState().recordResult({
            exerciseId: 'ex-1',
            type: 'progression',
            correct: true,
            responseTime: 1000,
          });
        });

        const state = useProgressStore.getState();
        state.recentResults.push({
          exerciseId: 'ex-old',
          type: 'rhythm',
          correct: false,
          responseTime: 500,
          timestamp: yesterday,
        });

        const todaysResults = selectTodaysProgress(state);
        expect(todaysResults).toHaveLength(1);
        expect(todaysResults[0].exerciseId).toBe('ex-1');
      });
    });
  });

  describe('persistence', () => {
    it('should have persist configuration with correct storage key', () => {
      // Zustand persist middleware uses 'ear-training-progress' as the key
      // We verify the store is configured with persist by checking it has persist API
      const store = useProgressStore;
      expect(store.persist).toBeDefined();
      expect(store.persist.getOptions().name).toBe('ear-training-progress');
    });
  });
});
