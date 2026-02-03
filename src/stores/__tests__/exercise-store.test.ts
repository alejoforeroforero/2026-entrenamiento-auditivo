import { act } from '@testing-library/react';
import { useExerciseStore } from '../exercise-store';

const mockProgressions = [
  { id: 'prog-1', name: 'I-IV-V-I', numerals: ['I', 'IV', 'V', 'I'], description: 'Basic progression' },
  { id: 'prog-2', name: 'I-V-vi-IV', numerals: ['I', 'V', 'vi', 'IV'], description: 'Pop progression' },
  { id: 'prog-3', name: 'ii-V-I', numerals: ['ii', 'V', 'I'], description: 'Jazz turnaround' },
  { id: 'prog-4', name: 'I-vi-IV-V', numerals: ['I', 'vi', 'IV', 'V'], description: '50s progression' },
  { id: 'prog-5', name: 'i-iv-V', numerals: ['i', 'iv', 'V'], description: 'Minor progression' },
];

describe('exercise-store', () => {
  beforeEach(() => {
    act(() => {
      useExerciseStore.getState().resetSession();
      useExerciseStore.getState().setProgressions([]);
    });
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useExerciseStore.getState();

      expect(state.currentExercise).toBeNull();
      expect(state.selectedAnswer).toBeNull();
      expect(state.isAnswered).toBe(false);
      expect(state.isCorrect).toBeNull();
      expect(state.exerciseType).toBe('progression');
      expect(state.selectedGenre).toBe('all');
      expect(state.difficulty).toBe('beginner');
      expect(state.sessionCorrect).toBe(0);
      expect(state.sessionTotal).toBe(0);
      expect(state.progressions).toEqual([]);
    });
  });

  describe('setExerciseType', () => {
    it('should update exercise type', () => {
      act(() => {
        useExerciseStore.getState().setExerciseType('rhythm');
      });

      expect(useExerciseStore.getState().exerciseType).toBe('rhythm');
    });
  });

  describe('setGenre', () => {
    it('should update selected genre', () => {
      act(() => {
        useExerciseStore.getState().setGenre('salsa');
      });

      expect(useExerciseStore.getState().selectedGenre).toBe('salsa');
    });
  });

  describe('setDifficulty', () => {
    it('should update difficulty', () => {
      act(() => {
        useExerciseStore.getState().setDifficulty('advanced');
      });

      expect(useExerciseStore.getState().difficulty).toBe('advanced');
    });
  });

  describe('setProgressions', () => {
    it('should update progressions', () => {
      act(() => {
        useExerciseStore.getState().setProgressions(mockProgressions);
      });

      expect(useExerciseStore.getState().progressions).toEqual(mockProgressions);
    });
  });

  describe('generateExercise', () => {
    it('should not generate exercise when progressions is empty', () => {
      act(() => {
        useExerciseStore.getState().generateExercise();
      });

      expect(useExerciseStore.getState().currentExercise).toBeNull();
    });

    it('should generate exercise when progressions exist', () => {
      act(() => {
        useExerciseStore.getState().setProgressions(mockProgressions);
        useExerciseStore.getState().generateExercise();
      });

      const state = useExerciseStore.getState();
      expect(state.currentExercise).not.toBeNull();
      expect(state.currentExercise?.type).toBe('progression');
    });

    it('should create exercise with 4 options', () => {
      act(() => {
        useExerciseStore.getState().setProgressions(mockProgressions);
        useExerciseStore.getState().generateExercise();
      });

      const exercise = useExerciseStore.getState().currentExercise;
      expect(exercise?.options).toHaveLength(4);
    });

    it('should have exactly one correct option', () => {
      act(() => {
        useExerciseStore.getState().setProgressions(mockProgressions);
        useExerciseStore.getState().generateExercise();
      });

      const exercise = useExerciseStore.getState().currentExercise;
      const correctOptions = exercise?.options.filter(o => o.correct);
      expect(correctOptions).toHaveLength(1);
    });

    it('should reset answer state when generating new exercise', () => {
      act(() => {
        useExerciseStore.getState().setProgressions(mockProgressions);
        useExerciseStore.getState().generateExercise();
        useExerciseStore.getState().submitAnswer(useExerciseStore.getState().currentExercise!.options[0].id);
        useExerciseStore.getState().generateExercise();
      });

      const state = useExerciseStore.getState();
      expect(state.selectedAnswer).toBeNull();
      expect(state.isAnswered).toBe(false);
      expect(state.isCorrect).toBeNull();
    });

    it('should set correct mode based on first numeral', () => {
      act(() => {
        useExerciseStore.getState().setProgressions([
          { id: 'minor-prog', name: 'i-iv-V', numerals: ['i', 'iv', 'V'], description: null },
        ]);
        useExerciseStore.getState().generateExercise();
      });

      const exercise = useExerciseStore.getState().currentExercise;
      if (exercise && 'progression' in exercise) {
        expect(exercise.progression.mode).toBe('minor');
      }
    });

    it('should generate exercise with timestamp-based id', () => {
      act(() => {
        useExerciseStore.getState().setProgressions(mockProgressions);
        useExerciseStore.getState().generateExercise();
      });

      const exercise = useExerciseStore.getState().currentExercise;
      expect(exercise?.id).toMatch(/^prog-\d+$/);
    });
  });

  describe('submitAnswer', () => {
    beforeEach(() => {
      act(() => {
        useExerciseStore.getState().setProgressions(mockProgressions);
        useExerciseStore.getState().generateExercise();
      });
    });

    it('should return false when no current exercise', () => {
      act(() => {
        useExerciseStore.getState().resetSession();
      });

      let result: boolean = false;
      act(() => {
        result = useExerciseStore.getState().submitAnswer('some-id');
      });

      expect(result).toBe(false);
    });

    it('should mark as answered after submission', () => {
      const exercise = useExerciseStore.getState().currentExercise!;

      act(() => {
        useExerciseStore.getState().submitAnswer(exercise.options[0].id);
      });

      expect(useExerciseStore.getState().isAnswered).toBe(true);
    });

    it('should set selectedAnswer', () => {
      const exercise = useExerciseStore.getState().currentExercise!;
      const answerId = exercise.options[0].id;

      act(() => {
        useExerciseStore.getState().submitAnswer(answerId);
      });

      expect(useExerciseStore.getState().selectedAnswer).toBe(answerId);
    });

    it('should return true and set isCorrect when answer is correct', () => {
      const exercise = useExerciseStore.getState().currentExercise!;
      const correctAnswer = exercise.correctAnswer;

      let result: boolean = false;
      act(() => {
        result = useExerciseStore.getState().submitAnswer(correctAnswer);
      });

      expect(result).toBe(true);
      expect(useExerciseStore.getState().isCorrect).toBe(true);
    });

    it('should return false and set isCorrect when answer is incorrect', () => {
      const exercise = useExerciseStore.getState().currentExercise!;
      const wrongAnswer = exercise.options.find(o => !o.correct)!.id;

      let result: boolean = false;
      act(() => {
        result = useExerciseStore.getState().submitAnswer(wrongAnswer);
      });

      expect(result).toBe(false);
      expect(useExerciseStore.getState().isCorrect).toBe(false);
    });

    it('should increment sessionTotal on any answer', () => {
      const exercise = useExerciseStore.getState().currentExercise!;

      act(() => {
        useExerciseStore.getState().submitAnswer(exercise.options[0].id);
      });

      expect(useExerciseStore.getState().sessionTotal).toBe(1);
    });

    it('should increment sessionCorrect only on correct answer', () => {
      const exercise = useExerciseStore.getState().currentExercise!;
      const correctAnswer = exercise.correctAnswer;

      act(() => {
        useExerciseStore.getState().submitAnswer(correctAnswer);
      });

      expect(useExerciseStore.getState().sessionCorrect).toBe(1);
    });

    it('should not increment sessionCorrect on wrong answer', () => {
      const exercise = useExerciseStore.getState().currentExercise!;
      const wrongAnswer = exercise.options.find(o => !o.correct)!.id;

      act(() => {
        useExerciseStore.getState().submitAnswer(wrongAnswer);
      });

      expect(useExerciseStore.getState().sessionCorrect).toBe(0);
    });
  });

  describe('nextExercise', () => {
    it('should generate a new exercise and reset answer state', () => {
      act(() => {
        useExerciseStore.getState().setProgressions(mockProgressions);
        useExerciseStore.getState().generateExercise();
        useExerciseStore.getState().submitAnswer(useExerciseStore.getState().currentExercise!.correctAnswer);
      });

      expect(useExerciseStore.getState().isAnswered).toBe(true);

      act(() => {
        useExerciseStore.getState().nextExercise();
      });

      const state = useExerciseStore.getState();
      expect(state.currentExercise).not.toBeNull();
      expect(state.isAnswered).toBe(false);
      expect(state.selectedAnswer).toBeNull();
    });
  });

  describe('resetSession', () => {
    it('should reset all session state', () => {
      act(() => {
        useExerciseStore.getState().setProgressions(mockProgressions);
        useExerciseStore.getState().generateExercise();
        useExerciseStore.getState().submitAnswer(useExerciseStore.getState().currentExercise!.correctAnswer);
        useExerciseStore.getState().resetSession();
      });

      const state = useExerciseStore.getState();
      expect(state.currentExercise).toBeNull();
      expect(state.selectedAnswer).toBeNull();
      expect(state.isAnswered).toBe(false);
      expect(state.isCorrect).toBeNull();
      expect(state.sessionCorrect).toBe(0);
      expect(state.sessionTotal).toBe(0);
    });

    it('should not reset progressions', () => {
      act(() => {
        useExerciseStore.getState().setProgressions(mockProgressions);
        useExerciseStore.getState().resetSession();
      });

      expect(useExerciseStore.getState().progressions).toEqual(mockProgressions);
    });

    it('should not reset exerciseType, genre, or difficulty', () => {
      act(() => {
        useExerciseStore.getState().setExerciseType('rhythm');
        useExerciseStore.getState().setGenre('salsa');
        useExerciseStore.getState().setDifficulty('advanced');
        useExerciseStore.getState().resetSession();
      });

      const state = useExerciseStore.getState();
      expect(state.exerciseType).toBe('rhythm');
      expect(state.selectedGenre).toBe('salsa');
      expect(state.difficulty).toBe('advanced');
    });
  });

  describe('session tracking', () => {
    it('should track multiple exercises in a session', () => {
      act(() => {
        useExerciseStore.getState().setProgressions(mockProgressions);
      });

      for (let i = 0; i < 5; i++) {
        act(() => {
          useExerciseStore.getState().generateExercise();
          const exercise = useExerciseStore.getState().currentExercise!;
          const answer = i % 2 === 0 ? exercise.correctAnswer : exercise.options.find(o => !o.correct)!.id;
          useExerciseStore.getState().submitAnswer(answer);
        });
      }

      const state = useExerciseStore.getState();
      expect(state.sessionTotal).toBe(5);
      expect(state.sessionCorrect).toBe(3);
    });
  });
});
