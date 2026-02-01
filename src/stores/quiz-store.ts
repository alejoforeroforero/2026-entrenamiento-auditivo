'use client';

import { create } from 'zustand';
import { QuizMode, QuizQuestion, QuizSummaryItem } from '@/types/quiz';

const MAX_ATTEMPTS = 3;
const TOTAL_QUESTIONS = 10;

interface QuizState {
  sessionId: string | null;
  mode: QuizMode | null;
  genre: string | null;
  genreName: string | null;
  questions: QuizQuestion[];
  currentIndex: number;
  currentAttempts: number;
  currentAnswer: string[];
  isCompleted: boolean;
  isLoading: boolean;

  startQuiz: (params: {
    sessionId: string | null;
    genre: string;
    genreName: string;
    mode: QuizMode;
    questions: QuizQuestion[];
  }) => void;
  setCurrentAnswer: (answer: string[]) => void;
  submitAnswer: () => { isCorrect: boolean; attemptsRemaining: number };
  nextQuestion: () => void;
  completeQuiz: () => void;
  resetQuiz: () => void;
  getCurrentQuestion: () => QuizQuestion | null;
  getProgress: () => { current: number; total: number; correct: number };
  getSummary: () => QuizSummaryItem[];
}

export const useQuizStore = create<QuizState>((set, get) => ({
  sessionId: null,
  mode: null,
  genre: null,
  genreName: null,
  questions: [],
  currentIndex: 0,
  currentAttempts: 0,
  currentAnswer: [],
  isCompleted: false,
  isLoading: false,

  startQuiz: ({ sessionId, genre, genreName, mode, questions }) => {
    set({
      sessionId,
      genre,
      genreName,
      mode,
      questions,
      currentIndex: 0,
      currentAttempts: 0,
      currentAnswer: [],
      isCompleted: false,
      isLoading: false,
    });
  },

  setCurrentAnswer: (answer) => {
    set({ currentAnswer: answer });
  },

  submitAnswer: () => {
    const { questions, currentIndex, currentAttempts, currentAnswer } = get();
    const question = questions[currentIndex];
    if (!question) return { isCorrect: false, attemptsRemaining: 0 };

    const isCorrect = arraysEqual(currentAnswer, question.correctAnswer);
    const newAttempts = currentAttempts + 1;
    const attemptsRemaining = MAX_ATTEMPTS - newAttempts;

    const updatedQuestions = [...questions];
    updatedQuestions[currentIndex] = {
      ...question,
      attemptsUsed: newAttempts,
      isCorrect: isCorrect || question.isCorrect,
      userAnswer: currentAnswer,
    };

    set({
      questions: updatedQuestions,
      currentAttempts: newAttempts,
    });

    return { isCorrect, attemptsRemaining };
  },

  nextQuestion: () => {
    const { currentIndex, questions } = get();
    const nextIndex = currentIndex + 1;

    if (nextIndex >= questions.length) {
      set({ isCompleted: true });
    } else {
      set({
        currentIndex: nextIndex,
        currentAttempts: 0,
        currentAnswer: [],
      });
    }
  },

  completeQuiz: () => {
    set({ isCompleted: true });
  },

  resetQuiz: () => {
    set({
      sessionId: null,
      mode: null,
      genre: null,
      genreName: null,
      questions: [],
      currentIndex: 0,
      currentAttempts: 0,
      currentAnswer: [],
      isCompleted: false,
      isLoading: false,
    });
  },

  getCurrentQuestion: () => {
    const { questions, currentIndex } = get();
    return questions[currentIndex] || null;
  },

  getProgress: () => {
    const { questions, currentIndex } = get();
    const correct = questions.filter((q) => q.isCorrect).length;
    return {
      current: currentIndex + 1,
      total: questions.length || TOTAL_QUESTIONS,
      correct,
    };
  },

  getSummary: (): QuizSummaryItem[] => {
    const { questions } = get();
    return questions.map((q) => ({
      questionNumber: q.questionNumber,
      isCorrect: q.isCorrect,
      attemptsUsed: q.attemptsUsed,
      progressionName: q.progressionName,
      songTitle: q.songTitle,
      userAnswer: q.userAnswer,
      correctAnswer: q.correctAnswer,
    }));
  },
}));

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
}
