'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuizFeedbackProps {
  isCorrect: boolean | null;
  correctAnswer?: string;
  attemptsRemaining: number;
  onRetry: () => void;
  onNext: () => void;
  show: boolean;
}

export function QuizFeedback({
  isCorrect,
  correctAnswer,
  attemptsRemaining,
  onRetry,
  onNext,
  show,
}: QuizFeedbackProps) {
  const canRetry = !isCorrect && attemptsRemaining > 0;
  const showCorrectAnswer = !isCorrect && attemptsRemaining === 0;

  return (
    <AnimatePresence>
      {show && isCorrect !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            'p-3 rounded-lg border',
            isCorrect
              ? 'bg-green-500/10 border-green-500/30'
              : canRetry
              ? 'bg-amber-500/10 border-amber-500/30'
              : 'bg-red-500/10 border-red-500/30'
          )}
        >
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            ) : (
              <XCircle
                className={cn(
                  'w-5 h-5 flex-shrink-0',
                  canRetry ? 'text-amber-500' : 'text-red-500'
                )}
              />
            )}

            <div className="flex-1 min-w-0">
              <h4
                className={cn(
                  'font-semibold text-sm',
                  isCorrect
                    ? 'text-green-600'
                    : canRetry
                    ? 'text-amber-600'
                    : 'text-red-600'
                )}
              >
                {isCorrect
                  ? '¡Correcto!'
                  : canRetry
                  ? 'Incorrecto - Intenta de nuevo'
                  : 'Sin intentos'}
              </h4>

              {canRetry && (
                <p className="text-xs text-muted-foreground">
                  Te quedan {attemptsRemaining} intento{attemptsRemaining !== 1 ? 's' : ''}
                </p>
              )}

              {showCorrectAnswer && correctAnswer && (
                <p className="text-xs text-muted-foreground">
                  Respuesta: <strong>{correctAnswer}</strong>
                </p>
              )}
            </div>

            <div className="flex gap-2 flex-shrink-0">
              {canRetry ? (
                <Button onClick={onRetry} size="sm" variant="outline" className="h-8 text-xs">
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Reintentar
                </Button>
              ) : (
                <Button onClick={onNext} size="sm" className="h-8 text-xs">
                  Siguiente
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
