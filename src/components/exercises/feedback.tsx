'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@heroui/react';
import { cn } from '@/lib/utils';

interface FeedbackProps {
  isCorrect: boolean | null;
  correctAnswer?: string;
  explanation?: string;
  onNext: () => void;
  show: boolean;
}

export function Feedback({
  isCorrect,
  correctAnswer,
  explanation,
  onNext,
  show,
}: FeedbackProps) {
  return (
    <AnimatePresence>
      {show && isCorrect !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            'p-4 rounded-lg border',
            isCorrect
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          )}
        >
          <div className="flex items-start gap-3">
            {isCorrect ? (
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            )}

            <div className="flex-1">
              <h4
                className={cn(
                  'font-semibold',
                  isCorrect ? 'text-green-600' : 'text-red-600'
                )}
              >
                {isCorrect ? '¡Correcto!' : 'Incorrecto'}
              </h4>

              {!isCorrect && correctAnswer && (
                <p className="text-sm text-muted-foreground mt-1">
                  La respuesta correcta era: <strong>{correctAnswer}</strong>
                </p>
              )}

              {explanation && (
                <p className="text-sm text-muted-foreground mt-2">
                  {explanation}
                </p>
              )}
            </div>

            <Button onPress={onNext} size="sm" color="primary" className="flex-shrink-0">
              Siguiente
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
