'use client';

import { useState, useCallback, useTransition } from 'react';
import { QuizModeSelector, QuizQuestionComponent, QuizSummary } from '@/components/quiz';
import { useQuizStore } from '@/stores/quiz-store';
import { QuizMode } from '@/types/quiz';
import { startQuizAction, saveQuestionResultAction, completeQuizAction } from './actions';

interface QuizClientProps {
  genre: string;
  genreName: string;
  isAuthenticated: boolean;
}

export function QuizClient({ genre, genreName, isAuthenticated }: QuizClientProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    sessionId,
    mode,
    questions,
    currentIndex,
    currentAttempts,
    currentAnswer,
    isCompleted,
    startQuiz,
    setCurrentAnswer,
    submitAnswer,
    nextQuestion,
    resetQuiz,
    getCurrentQuestion,
    getProgress,
    getSummary,
  } = useQuizStore();

  const handleSelectMode = useCallback(
    (selectedMode: QuizMode) => {
      setError(null);
      startTransition(async () => {
        const result = await startQuizAction(genre, selectedMode);

        if ('error' in result && result.error) {
          setError(result.error);
          return;
        }

        if (!result.genreId || !result.genreName || !result.mode || !result.questions) {
          setError('Error al iniciar el quiz');
          return;
        }

        startQuiz({
          sessionId: result.sessionId ?? null,
          genre: result.genreId,
          genreName: result.genreName,
          mode: result.mode,
          questions: result.questions,
        });
      });
    },
    [genre, startQuiz]
  );

  const handleSubmitAnswer = useCallback(() => {
    const result = submitAnswer();
    const question = getCurrentQuestion();

    if (question && isAuthenticated && !question.id.startsWith('local-')) {
      saveQuestionResultAction(
        question.id,
        currentAnswer,
        result.isCorrect,
        currentAttempts + 1
      );
    }

    return result;
  }, [submitAnswer, getCurrentQuestion, currentAnswer, currentAttempts, isAuthenticated]);

  const handleNextQuestion = useCallback(() => {
    const question = getCurrentQuestion();
    const isLastQuestion = currentIndex === questions.length - 1;

    if (isLastQuestion) {
      if (sessionId && isAuthenticated) {
        completeQuizAction(sessionId);
      }
    }

    nextQuestion();
  }, [nextQuestion, getCurrentQuestion, currentIndex, questions.length, sessionId, isAuthenticated]);

  const handleRestart = useCallback(() => {
    resetQuiz();
  }, [resetQuiz]);

  if (!mode) {
    return (
      <div className="container py-4 px-4">
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500">
            {error}
          </div>
        )}
        <QuizModeSelector
          onSelectMode={handleSelectMode}
          isLoading={isPending}
          genreName={genreName}
        />
      </div>
    );
  }

  if (isCompleted) {
    const summary = getSummary();
    const progress = getProgress();

    return (
      <div className="container py-4 px-4">
        <QuizSummary
          items={summary}
          totalCorrect={progress.correct}
          totalQuestions={progress.total}
          genreName={genreName}
          genre={genre}
          mode={mode}
          isAuthenticated={isAuthenticated}
          onRestart={handleRestart}
        />
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const progress = getProgress();

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="container py-4 px-4">
      <QuizQuestionComponent
        question={currentQuestion}
        mode={mode}
        progress={progress}
        currentAttempts={currentAttempts}
        currentAnswer={currentAnswer}
        onAnswerChange={setCurrentAnswer}
        onSubmit={handleSubmitAnswer}
        onNext={handleNextQuestion}
      />
    </div>
  );
}
