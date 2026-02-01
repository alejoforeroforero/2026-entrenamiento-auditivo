import { prisma } from '@/lib/db';
import { QuizMode as PrismaQuizMode } from '@prisma/client';
import { QuizMode, QuizQuestion, QuizSession, QuizStats } from '@/types/quiz';

export async function createQuizSession(
  userId: string,
  genreId: string,
  mode: QuizMode
): Promise<string> {
  const session = await prisma.quizSession.create({
    data: {
      userId,
      genreId,
      mode: mode as PrismaQuizMode,
      totalQuestions: 10,
    },
  });
  return session.id;
}

export async function getProgressionsForQuiz(genreId: string, limit: number = 10) {
  const songs = await prisma.song.findMany({
    where: { genreId },
    include: { progression: true },
    distinct: ['progressionId'],
  });

  const progressions = songs
    .map((s) => s.progression)
    .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i);

  const shuffled = progressions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit);
}

export async function getSongsForQuiz(genreId: string, limit: number = 10) {
  const songs = await prisma.song.findMany({
    where: {
      genreId,
      youtubeId: { not: null },
    },
    include: { progression: true },
    take: 50,
  });

  const shuffled = songs.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit);
}

export async function createQuizQuestions(
  sessionId: string,
  questions: {
    questionNumber: number;
    progressionId?: string;
    songId?: string;
    correctAnswer: string[];
  }[]
) {
  // Create questions one by one (createMany uses transactions which aren't supported in HTTP mode)
  for (const q of questions) {
    await prisma.quizQuestion.create({
      data: {
        sessionId,
        questionNumber: q.questionNumber,
        progressionId: q.progressionId,
        songId: q.songId,
        correctAnswer: q.correctAnswer,
      },
    });
  }

  return prisma.quizQuestion.findMany({
    where: { sessionId },
    orderBy: { questionNumber: 'asc' },
    include: {
      progression: true,
      song: true,
    },
  });
}

export async function saveQuestionResult(
  questionId: string,
  userAnswer: string[],
  isCorrect: boolean,
  attemptsUsed: number
) {
  return prisma.quizQuestion.update({
    where: { id: questionId },
    data: {
      userAnswer,
      isCorrect,
      attemptsUsed,
    },
  });
}

export async function completeQuizSession(sessionId: string) {
  const questions = await prisma.quizQuestion.findMany({
    where: { sessionId },
  });

  const correctAnswers = questions.filter((q) => q.isCorrect).length;

  return prisma.quizSession.update({
    where: { id: sessionId },
    data: {
      completedAt: new Date(),
      correctAnswers,
    },
  });
}

export async function getUserQuizSessions(
  userId: string,
  limit: number = 10
): Promise<QuizSession[]> {
  const sessions = await prisma.quizSession.findMany({
    where: { userId },
    include: {
      genre: true,
      questions: {
        include: {
          progression: true,
          song: true,
        },
        orderBy: { questionNumber: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return sessions.map((s) => ({
    id: s.id,
    userId: s.userId,
    genreId: s.genreId,
    genreName: s.genre.label,
    mode: s.mode as QuizMode,
    totalQuestions: s.totalQuestions,
    correctAnswers: s.correctAnswers,
    completedAt: s.completedAt || undefined,
    createdAt: s.createdAt,
    questions: s.questions.map((q) => ({
      id: q.id,
      questionNumber: q.questionNumber,
      progressionId: q.progressionId || undefined,
      songId: q.songId || undefined,
      progressionName: q.progression?.name,
      songTitle: q.song?.title,
      songArtist: q.song?.artist,
      songKey: q.song?.key,
      songMode: q.song?.mode as 'major' | 'minor' | undefined,
      songYoutubeId: q.song?.youtubeId || undefined,
      songStartTime: q.song?.startTime || undefined,
      songDuration: q.song?.duration || undefined,
      numerals: q.progression?.numerals || [],
      attemptsUsed: q.attemptsUsed,
      isCorrect: q.isCorrect,
      userAnswer: q.userAnswer,
      correctAnswer: q.correctAnswer,
    })),
  }));
}

export async function getUserQuizStats(userId: string): Promise<QuizStats> {
  const sessions = await prisma.quizSession.findMany({
    where: {
      userId,
      completedAt: { not: null },
    },
    include: {
      genre: true,
      questions: {
        include: { progression: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalQuizzes = sessions.length;
  const totalQuestions = sessions.reduce((acc, s) => acc + s.totalQuestions, 0);
  const correctAnswers = sessions.reduce((acc, s) => acc + s.correctAnswers, 0);
  const averageScore = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  const bestScore =
    sessions.length > 0
      ? Math.max(...sessions.map((s) => (s.correctAnswers / s.totalQuestions) * 100))
      : 0;

  const quizzesByGenre: Record<string, { total: number; correct: number; quizCount: number }> = {};
  const quizzesByMode: Record<QuizMode, { total: number; correct: number; quizCount: number }> = {
    piano: { total: 0, correct: 0, quizCount: 0 },
    repertoire: { total: 0, correct: 0, quizCount: 0 },
  };

  const progressionMisses: Record<string, { name: string; genreId: string; count: number }> = {};

  for (const session of sessions) {
    const genreLabel = session.genre.label;
    if (!quizzesByGenre[genreLabel]) {
      quizzesByGenre[genreLabel] = { total: 0, correct: 0, quizCount: 0 };
    }
    quizzesByGenre[genreLabel].total += session.totalQuestions;
    quizzesByGenre[genreLabel].correct += session.correctAnswers;
    quizzesByGenre[genreLabel].quizCount += 1;

    const mode = session.mode as QuizMode;
    quizzesByMode[mode].total += session.totalQuestions;
    quizzesByMode[mode].correct += session.correctAnswers;
    quizzesByMode[mode].quizCount += 1;

    for (const q of session.questions) {
      if (!q.isCorrect && q.progression) {
        if (!progressionMisses[q.progressionId!]) {
          progressionMisses[q.progressionId!] = { name: q.progression.name, genreId: session.genreId, count: 0 };
        }
        progressionMisses[q.progressionId!].count += 1;
      }
    }
  }

  const mostMissedProgressions = Object.entries(progressionMisses)
    .map(([id, data]) => ({
      progressionId: id,
      name: data.name,
      genreId: data.genreId,
      missCount: data.count,
    }))
    .sort((a, b) => b.missCount - a.missCount)
    .slice(0, 5);

  const recentQuizzes: QuizSession[] = sessions.slice(0, 5).map((s) => ({
    id: s.id,
    userId: s.userId,
    genreId: s.genreId,
    genreName: s.genre.label,
    mode: s.mode as QuizMode,
    totalQuestions: s.totalQuestions,
    correctAnswers: s.correctAnswers,
    completedAt: s.completedAt || undefined,
    createdAt: s.createdAt,
    questions: [],
  }));

  return {
    totalQuizzes,
    totalQuestions,
    correctAnswers,
    averageScore,
    bestScore,
    quizzesByGenre,
    quizzesByMode,
    recentQuizzes,
    mostMissedProgressions,
  };
}

export async function getQuizSession(sessionId: string): Promise<QuizSession | null> {
  const session = await prisma.quizSession.findUnique({
    where: { id: sessionId },
    include: {
      genre: true,
      questions: {
        include: {
          progression: true,
          song: true,
        },
        orderBy: { questionNumber: 'asc' },
      },
    },
  });

  if (!session) return null;

  return {
    id: session.id,
    userId: session.userId,
    genreId: session.genreId,
    genreName: session.genre.label,
    mode: session.mode as QuizMode,
    totalQuestions: session.totalQuestions,
    correctAnswers: session.correctAnswers,
    completedAt: session.completedAt || undefined,
    createdAt: session.createdAt,
    questions: session.questions.map((q) => ({
      id: q.id,
      questionNumber: q.questionNumber,
      progressionId: q.progressionId || undefined,
      songId: q.songId || undefined,
      progressionName: q.progression?.name,
      songTitle: q.song?.title,
      songArtist: q.song?.artist,
      songKey: q.song?.key,
      songMode: q.song?.mode as 'major' | 'minor' | undefined,
      songYoutubeId: q.song?.youtubeId || undefined,
      songStartTime: q.song?.startTime || undefined,
      songDuration: q.song?.duration || undefined,
      numerals: q.progression?.numerals || [],
      attemptsUsed: q.attemptsUsed,
      isCorrect: q.isCorrect,
      userAnswer: q.userAnswer,
      correctAnswer: q.correctAnswer,
    })),
  };
}
