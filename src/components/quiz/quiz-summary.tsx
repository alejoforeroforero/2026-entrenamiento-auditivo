'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, RotateCcw, Home, User, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuizSummaryItem } from '@/types/quiz';
import { cn } from '@/lib/utils';

interface QuizSummaryProps {
  items: QuizSummaryItem[];
  totalCorrect: number;
  totalQuestions: number;
  genreName: string;
  genre: string;
  mode: 'piano' | 'repertoire';
  isAuthenticated: boolean;
  onRestart: () => void;
}

export function QuizSummary({
  items,
  totalCorrect,
  totalQuestions,
  genreName,
  genre,
  mode,
  isAuthenticated,
  onRestart,
}: QuizSummaryProps) {
  const percentage = Math.round((totalCorrect / totalQuestions) * 100);
  const grade = getGrade(percentage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <Card className="text-center">
        <CardHeader className="pb-2">
          <div className="flex justify-center mb-4">
            <div
              className={cn(
                'w-20 h-20 rounded-full flex items-center justify-center',
                grade.bgColor
              )}
            >
              <Trophy className={cn('w-10 h-10', grade.textColor)} />
            </div>
          </div>
          <CardTitle className="text-3xl">{grade.label}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-5xl font-bold">
            {totalCorrect}/{totalQuestions}
          </div>
          <p className="text-muted-foreground">
            {percentage}% de aciertos en {genreName} ({mode === 'piano' ? 'Piano' : 'Repertorio'})
          </p>

          {!isAuthenticated && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm">
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Inicia sesión
                </Link>{' '}
                para guardar tu progreso y ver estadísticas
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumen de respuestas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg',
                  item.isCorrect ? 'bg-green-500/5' : 'bg-red-500/5'
                )}
              >
                {item.isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {item.progressionName || item.songTitle || `Pregunta ${item.questionNumber}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.attemptsUsed} intento{item.attemptsUsed !== 1 ? 's' : ''} ·{' '}
                    {item.correctAnswer.join(' → ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onRestart} className="flex-1">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reiniciar Quiz
        </Button>
        <Link href={`/${genre}`} className="flex-1">
          <Button variant="outline" className="w-full">
            <Home className="w-4 h-4 mr-2" />
            Volver al género
          </Button>
        </Link>
        {isAuthenticated && (
          <Link href="/perfil" className="flex-1">
            <Button variant="outline" className="w-full">
              <User className="w-4 h-4 mr-2" />
              Ver perfil
            </Button>
          </Link>
        )}
      </div>
    </motion.div>
  );
}

function getGrade(percentage: number) {
  if (percentage >= 90) {
    return { label: '¡Excelente!', bgColor: 'bg-green-500/20', textColor: 'text-green-500' };
  }
  if (percentage >= 70) {
    return { label: '¡Muy bien!', bgColor: 'bg-blue-500/20', textColor: 'text-blue-500' };
  }
  if (percentage >= 50) {
    return { label: 'Buen intento', bgColor: 'bg-amber-500/20', textColor: 'text-amber-500' };
  }
  return { label: 'Sigue practicando', bgColor: 'bg-red-500/20', textColor: 'text-red-500' };
}
