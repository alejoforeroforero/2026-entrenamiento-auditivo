export type QuizMode = 'piano' | 'repertoire';

export interface QuizQuestion {
  id: string;
  questionNumber: number;
  progressionId?: string;
  songId?: string;
  progressionName?: string;
  songTitle?: string;
  songArtist?: string;
  songKey?: string;
  songMode?: 'major' | 'minor';
  songYoutubeId?: string;
  songStartTime?: number;
  songDuration?: number;
  numerals: string[];
  attemptsUsed: number;
  isCorrect: boolean;
  userAnswer: string[];
  correctAnswer: string[];
}

export interface QuizSession {
  id: string;
  userId?: string;
  genreId: string;
  genreName?: string;
  mode: QuizMode;
  totalQuestions: number;
  correctAnswers: number;
  completedAt?: Date;
  createdAt: Date;
  questions: QuizQuestion[];
}

export interface QuizStats {
  totalQuizzes: number;
  totalQuestions: number;
  correctAnswers: number;
  averageScore: number;
  bestScore: number;
  quizzesByGenre: Record<string, { total: number; correct: number; quizCount: number }>;
  quizzesByMode: Record<QuizMode, { total: number; correct: number; quizCount: number }>;
  recentQuizzes: QuizSession[];
  mostMissedProgressions: { progressionId: string; name: string; genreId: string; missCount: number }[];
}

export interface QuizSummaryItem {
  questionNumber: number;
  isCorrect: boolean;
  attemptsUsed: number;
  progressionName?: string;
  songTitle?: string;
  userAnswer: string[];
  correctAnswer: string[];
}
