'use server';

import { auth } from '@/lib/auth';
import {
  createQuizSession,
  createQuizQuestions,
  getProgressionsForQuiz,
  getSongsForQuiz,
  saveQuestionResult,
  completeQuizSession,
} from '@/lib/db/queries/quiz';
import { QuizMode, QuizQuestion } from '@/types/quiz';
import { prisma } from '@/lib/db';

export async function startQuizAction(genreId: string, mode: QuizMode) {
  const session = await auth();
  const userId = session?.user?.id;

  const genre = await prisma.genre.findUnique({
    where: { id: genreId },
  });

  if (!genre) {
    return { error: 'Género no encontrado' };
  }

  let questions: QuizQuestion[] = [];
  let sessionId: string | null = null;

  if (mode === 'piano') {
    const progressions = await getProgressionsForQuiz(genreId, 10);

    if (progressions.length < 4) {
      return { error: 'No hay suficientes progresiones para este género' };
    }

    const questionsData = progressions.map((p, idx) => ({
      questionNumber: idx + 1,
      progressionId: p.id,
      correctAnswer: p.numerals,
    }));

    if (userId) {
      sessionId = await createQuizSession(userId, genreId, mode);
      const dbQuestions = await createQuizQuestions(sessionId, questionsData);

      questions = dbQuestions.map((q) => ({
        id: q.id,
        questionNumber: q.questionNumber,
        progressionId: q.progressionId || undefined,
        progressionName: q.progression?.name,
        numerals: q.progression?.numerals || [],
        attemptsUsed: 0,
        isCorrect: false,
        userAnswer: [],
        correctAnswer: q.correctAnswer,
      }));
    } else {
      questions = questionsData.map((q, idx) => ({
        id: `local-${idx}`,
        questionNumber: q.questionNumber,
        progressionId: q.progressionId,
        progressionName: progressions[idx].name,
        numerals: progressions[idx].numerals,
        attemptsUsed: 0,
        isCorrect: false,
        userAnswer: [],
        correctAnswer: q.correctAnswer,
      }));
    }
  } else {
    const songs = await getSongsForQuiz(genreId, 10);

    if (songs.length < 4) {
      return { error: 'No hay suficientes canciones con video para este género' };
    }

    const questionsData = songs.map((s, idx) => ({
      questionNumber: idx + 1,
      songId: s.id,
      progressionId: s.progressionId,
      correctAnswer: s.progression.numerals,
    }));

    if (userId) {
      sessionId = await createQuizSession(userId, genreId, mode);
      const dbQuestions = await createQuizQuestions(sessionId, questionsData);

      questions = dbQuestions.map((q) => ({
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
        attemptsUsed: 0,
        isCorrect: false,
        userAnswer: [],
        correctAnswer: q.correctAnswer,
      }));
    } else {
      questions = songs.map((s, idx) => ({
        id: `local-${idx}`,
        questionNumber: idx + 1,
        progressionId: s.progressionId,
        songId: s.id,
        progressionName: s.progression.name,
        songTitle: s.title,
        songArtist: s.artist,
        songKey: s.key,
        songMode: s.mode as 'major' | 'minor',
        songYoutubeId: s.youtubeId || undefined,
        songStartTime: s.startTime || undefined,
        songDuration: s.duration || undefined,
        numerals: s.progression.numerals,
        attemptsUsed: 0,
        isCorrect: false,
        userAnswer: [],
        correctAnswer: s.progression.numerals,
      }));
    }
  }

  return {
    sessionId,
    genreId,
    genreName: genre.label,
    mode,
    questions,
  };
}

export async function saveQuestionResultAction(
  questionId: string,
  userAnswer: string[],
  isCorrect: boolean,
  attemptsUsed: number
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false };
  }

  if (questionId.startsWith('local-')) {
    return { success: true };
  }

  await saveQuestionResult(questionId, userAnswer, isCorrect, attemptsUsed);
  return { success: true };
}

export async function completeQuizAction(sessionId: string | null) {
  const session = await auth();
  if (!session?.user?.id || !sessionId) {
    return { success: false };
  }

  await completeQuizSession(sessionId);
  return { success: true };
}
