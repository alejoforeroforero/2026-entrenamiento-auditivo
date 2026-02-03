import { act } from '@testing-library/react';
import { useQuizStore } from '../quiz-store';
import { QuizQuestion } from '@/types/quiz';

const createMockQuestion = (num: number, overrides: Partial<QuizQuestion> = {}): QuizQuestion => ({
  id: `q-${num}`,
  questionNumber: num,
  progressionId: `prog-${num}`,
  progressionName: `Progression ${num}`,
  numerals: ['I', 'IV', 'V', 'I'],
  attemptsUsed: 0,
  isCorrect: false,
  userAnswer: [],
  correctAnswer: ['I', 'IV', 'V', 'I'],
  ...overrides,
});

const mockQuestions: QuizQuestion[] = Array.from({ length: 10 }, (_, i) => createMockQuestion(i + 1));

describe('quiz-store', () => {
  beforeEach(() => {
    act(() => {
      useQuizStore.getState().resetQuiz();
    });
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useQuizStore.getState();

      expect(state.sessionId).toBeNull();
      expect(state.mode).toBeNull();
      expect(state.genre).toBeNull();
      expect(state.genreName).toBeNull();
      expect(state.questions).toEqual([]);
      expect(state.currentIndex).toBe(0);
      expect(state.currentAttempts).toBe(0);
      expect(state.currentAnswer).toEqual([]);
      expect(state.isCompleted).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('startQuiz', () => {
    it('should initialize quiz with provided parameters', () => {
      act(() => {
        useQuizStore.getState().startQuiz({
          sessionId: 'session-123',
          genre: 'salsa',
          genreName: 'Salsa',
          mode: 'piano',
          questions: mockQuestions,
        });
      });

      const state = useQuizStore.getState();
      expect(state.sessionId).toBe('session-123');
      expect(state.genre).toBe('salsa');
      expect(state.genreName).toBe('Salsa');
      expect(state.mode).toBe('piano');
      expect(state.questions).toEqual(mockQuestions);
    });

    it('should reset state when starting new quiz', () => {
      act(() => {
        useQuizStore.getState().startQuiz({
          sessionId: 'session-1',
          genre: 'salsa',
          genreName: 'Salsa',
          mode: 'piano',
          questions: mockQuestions,
        });
        useQuizStore.getState().setCurrentAnswer(['I', 'IV']);
        useQuizStore.getState().submitAnswer();
        useQuizStore.getState().startQuiz({
          sessionId: 'session-2',
          genre: 'cumbia',
          genreName: 'Cumbia',
          mode: 'repertoire',
          questions: mockQuestions,
        });
      });

      const state = useQuizStore.getState();
      expect(state.sessionId).toBe('session-2');
      expect(state.currentIndex).toBe(0);
      expect(state.currentAttempts).toBe(0);
      expect(state.currentAnswer).toEqual([]);
      expect(state.isCompleted).toBe(false);
    });
  });

  describe('setCurrentAnswer', () => {
    it('should update current answer', () => {
      act(() => {
        useQuizStore.getState().setCurrentAnswer(['I', 'IV', 'V']);
      });

      expect(useQuizStore.getState().currentAnswer).toEqual(['I', 'IV', 'V']);
    });
  });

  describe('submitAnswer', () => {
    beforeEach(() => {
      act(() => {
        useQuizStore.getState().startQuiz({
          sessionId: 'session-123',
          genre: 'salsa',
          genreName: 'Salsa',
          mode: 'piano',
          questions: mockQuestions,
        });
      });
    });

    it('should return incorrect when no question exists', () => {
      act(() => {
        useQuizStore.getState().resetQuiz();
      });

      let result = { isCorrect: false, attemptsRemaining: 0 };
      act(() => {
        result = useQuizStore.getState().submitAnswer();
      });

      expect(result.isCorrect).toBe(false);
      expect(result.attemptsRemaining).toBe(0);
    });

    it('should return correct when answer matches', () => {
      act(() => {
        useQuizStore.getState().setCurrentAnswer(['I', 'IV', 'V', 'I']);
      });

      let result = { isCorrect: false, attemptsRemaining: 0 };
      act(() => {
        result = useQuizStore.getState().submitAnswer();
      });

      expect(result.isCorrect).toBe(true);
    });

    it('should return incorrect when answer does not match', () => {
      act(() => {
        useQuizStore.getState().setCurrentAnswer(['I', 'ii', 'V', 'I']);
      });

      let result = { isCorrect: false, attemptsRemaining: 0 };
      act(() => {
        result = useQuizStore.getState().submitAnswer();
      });

      expect(result.isCorrect).toBe(false);
    });

    it('should increment attempts on each submission', () => {
      act(() => {
        useQuizStore.getState().setCurrentAnswer(['wrong']);
        useQuizStore.getState().submitAnswer();
      });

      expect(useQuizStore.getState().currentAttempts).toBe(1);

      act(() => {
        useQuizStore.getState().submitAnswer();
      });

      expect(useQuizStore.getState().currentAttempts).toBe(2);
    });

    it('should return remaining attempts (max 3)', () => {
      let result = { isCorrect: false, attemptsRemaining: 0 };

      act(() => {
        useQuizStore.getState().setCurrentAnswer(['wrong']);
        result = useQuizStore.getState().submitAnswer();
      });
      expect(result.attemptsRemaining).toBe(2);

      act(() => {
        result = useQuizStore.getState().submitAnswer();
      });
      expect(result.attemptsRemaining).toBe(1);

      act(() => {
        result = useQuizStore.getState().submitAnswer();
      });
      expect(result.attemptsRemaining).toBe(0);
    });

    it('should update question with attempts and user answer', () => {
      act(() => {
        useQuizStore.getState().setCurrentAnswer(['I', 'ii', 'V', 'I']);
        useQuizStore.getState().submitAnswer();
      });

      const question = useQuizStore.getState().questions[0];
      expect(question.attemptsUsed).toBe(1);
      expect(question.userAnswer).toEqual(['I', 'ii', 'V', 'I']);
    });

    it('should mark question as correct once answered correctly', () => {
      act(() => {
        useQuizStore.getState().setCurrentAnswer(['wrong']);
        useQuizStore.getState().submitAnswer();
        useQuizStore.getState().setCurrentAnswer(['I', 'IV', 'V', 'I']);
        useQuizStore.getState().submitAnswer();
      });

      const question = useQuizStore.getState().questions[0];
      expect(question.isCorrect).toBe(true);
    });

    it('should keep isCorrect true even after wrong attempts', () => {
      act(() => {
        useQuizStore.getState().setCurrentAnswer(['I', 'IV', 'V', 'I']);
        useQuizStore.getState().submitAnswer();
        useQuizStore.getState().setCurrentAnswer(['wrong']);
        useQuizStore.getState().submitAnswer();
      });

      const question = useQuizStore.getState().questions[0];
      expect(question.isCorrect).toBe(true);
    });
  });

  describe('nextQuestion', () => {
    beforeEach(() => {
      act(() => {
        useQuizStore.getState().startQuiz({
          sessionId: 'session-123',
          genre: 'salsa',
          genreName: 'Salsa',
          mode: 'piano',
          questions: mockQuestions,
        });
      });
    });

    it('should increment currentIndex', () => {
      act(() => {
        useQuizStore.getState().nextQuestion();
      });

      expect(useQuizStore.getState().currentIndex).toBe(1);
    });

    it('should reset currentAttempts', () => {
      act(() => {
        useQuizStore.getState().setCurrentAnswer(['wrong']);
        useQuizStore.getState().submitAnswer();
        useQuizStore.getState().nextQuestion();
      });

      expect(useQuizStore.getState().currentAttempts).toBe(0);
    });

    it('should reset currentAnswer', () => {
      act(() => {
        useQuizStore.getState().setCurrentAnswer(['I', 'IV', 'V']);
        useQuizStore.getState().nextQuestion();
      });

      expect(useQuizStore.getState().currentAnswer).toEqual([]);
    });

    it('should mark quiz as completed when reaching end', () => {
      act(() => {
        for (let i = 0; i < 10; i++) {
          useQuizStore.getState().nextQuestion();
        }
      });

      expect(useQuizStore.getState().isCompleted).toBe(true);
    });

    it('should not increment past questions length', () => {
      act(() => {
        for (let i = 0; i < 15; i++) {
          useQuizStore.getState().nextQuestion();
        }
      });

      expect(useQuizStore.getState().isCompleted).toBe(true);
    });
  });

  describe('completeQuiz', () => {
    it('should mark quiz as completed', () => {
      act(() => {
        useQuizStore.getState().startQuiz({
          sessionId: 'session-123',
          genre: 'salsa',
          genreName: 'Salsa',
          mode: 'piano',
          questions: mockQuestions,
        });
        useQuizStore.getState().completeQuiz();
      });

      expect(useQuizStore.getState().isCompleted).toBe(true);
    });
  });

  describe('resetQuiz', () => {
    it('should reset all state to initial values', () => {
      act(() => {
        useQuizStore.getState().startQuiz({
          sessionId: 'session-123',
          genre: 'salsa',
          genreName: 'Salsa',
          mode: 'piano',
          questions: mockQuestions,
        });
        useQuizStore.getState().setCurrentAnswer(['I', 'IV']);
        useQuizStore.getState().submitAnswer();
        useQuizStore.getState().nextQuestion();
        useQuizStore.getState().resetQuiz();
      });

      const state = useQuizStore.getState();
      expect(state.sessionId).toBeNull();
      expect(state.mode).toBeNull();
      expect(state.genre).toBeNull();
      expect(state.genreName).toBeNull();
      expect(state.questions).toEqual([]);
      expect(state.currentIndex).toBe(0);
      expect(state.currentAttempts).toBe(0);
      expect(state.currentAnswer).toEqual([]);
      expect(state.isCompleted).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('getCurrentQuestion', () => {
    it('should return null when no questions', () => {
      const question = useQuizStore.getState().getCurrentQuestion();
      expect(question).toBeNull();
    });

    it('should return current question', () => {
      act(() => {
        useQuizStore.getState().startQuiz({
          sessionId: 'session-123',
          genre: 'salsa',
          genreName: 'Salsa',
          mode: 'piano',
          questions: mockQuestions,
        });
      });

      const question = useQuizStore.getState().getCurrentQuestion();
      expect(question?.questionNumber).toBe(1);
    });

    it('should return correct question after navigation', () => {
      act(() => {
        useQuizStore.getState().startQuiz({
          sessionId: 'session-123',
          genre: 'salsa',
          genreName: 'Salsa',
          mode: 'piano',
          questions: mockQuestions,
        });
        useQuizStore.getState().nextQuestion();
        useQuizStore.getState().nextQuestion();
      });

      const question = useQuizStore.getState().getCurrentQuestion();
      expect(question?.questionNumber).toBe(3);
    });
  });

  describe('getProgress', () => {
    it('should return default progress when no quiz', () => {
      const progress = useQuizStore.getState().getProgress();

      expect(progress.current).toBe(1);
      expect(progress.total).toBe(10);
      expect(progress.correct).toBe(0);
    });

    it('should return correct progress during quiz', () => {
      act(() => {
        useQuizStore.getState().startQuiz({
          sessionId: 'session-123',
          genre: 'salsa',
          genreName: 'Salsa',
          mode: 'piano',
          questions: mockQuestions,
        });
        useQuizStore.getState().setCurrentAnswer(['I', 'IV', 'V', 'I']);
        useQuizStore.getState().submitAnswer();
        useQuizStore.getState().nextQuestion();
        useQuizStore.getState().setCurrentAnswer(['wrong']);
        useQuizStore.getState().submitAnswer();
        useQuizStore.getState().nextQuestion();
      });

      const progress = useQuizStore.getState().getProgress();
      expect(progress.current).toBe(3);
      expect(progress.total).toBe(10);
      expect(progress.correct).toBe(1);
    });
  });

  describe('getSummary', () => {
    it('should return empty array when no questions', () => {
      const summary = useQuizStore.getState().getSummary();
      expect(summary).toEqual([]);
    });

    it('should return summary of all questions', () => {
      act(() => {
        useQuizStore.getState().startQuiz({
          sessionId: 'session-123',
          genre: 'salsa',
          genreName: 'Salsa',
          mode: 'piano',
          questions: mockQuestions,
        });
        useQuizStore.getState().setCurrentAnswer(['I', 'IV', 'V', 'I']);
        useQuizStore.getState().submitAnswer();
        useQuizStore.getState().nextQuestion();
        useQuizStore.getState().setCurrentAnswer(['wrong', 'answer']);
        useQuizStore.getState().submitAnswer();
        useQuizStore.getState().submitAnswer();
      });

      const summary = useQuizStore.getState().getSummary();

      expect(summary).toHaveLength(10);
      expect(summary[0].questionNumber).toBe(1);
      expect(summary[0].isCorrect).toBe(true);
      expect(summary[0].attemptsUsed).toBe(1);
      expect(summary[1].questionNumber).toBe(2);
      expect(summary[1].isCorrect).toBe(false);
      expect(summary[1].attemptsUsed).toBe(2);
    });

    it('should include progression name and correct answer', () => {
      act(() => {
        useQuizStore.getState().startQuiz({
          sessionId: 'session-123',
          genre: 'salsa',
          genreName: 'Salsa',
          mode: 'piano',
          questions: mockQuestions,
        });
      });

      const summary = useQuizStore.getState().getSummary();
      expect(summary[0].progressionName).toBe('Progression 1');
      expect(summary[0].correctAnswer).toEqual(['I', 'IV', 'V', 'I']);
    });
  });

  describe('array comparison', () => {
    it('should correctly compare arrays of different lengths', () => {
      act(() => {
        useQuizStore.getState().startQuiz({
          sessionId: 'session-123',
          genre: 'salsa',
          genreName: 'Salsa',
          mode: 'piano',
          questions: [createMockQuestion(1, { correctAnswer: ['I', 'IV', 'V'] })],
        });
        useQuizStore.getState().setCurrentAnswer(['I', 'IV']);
      });

      let result = { isCorrect: false, attemptsRemaining: 0 };
      act(() => {
        result = useQuizStore.getState().submitAnswer();
      });

      expect(result.isCorrect).toBe(false);
    });

    it('should correctly compare arrays with same length but different values', () => {
      act(() => {
        useQuizStore.getState().startQuiz({
          sessionId: 'session-123',
          genre: 'salsa',
          genreName: 'Salsa',
          mode: 'piano',
          questions: [createMockQuestion(1, { correctAnswer: ['I', 'IV', 'V'] })],
        });
        useQuizStore.getState().setCurrentAnswer(['I', 'ii', 'V']);
      });

      let result = { isCorrect: false, attemptsRemaining: 0 };
      act(() => {
        result = useQuizStore.getState().submitAnswer();
      });

      expect(result.isCorrect).toBe(false);
    });
  });
});
