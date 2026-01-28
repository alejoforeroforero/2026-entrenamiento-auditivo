'use client';

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExerciseOption } from '@/types/music';

interface AnswerOptionsProps {
  options: ExerciseOption[];
  selectedAnswer: string | null;
  isAnswered: boolean;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
}

export function AnswerOptions({
  options,
  selectedAnswer,
  isAnswered,
  onSelect,
  disabled = false,
}: AnswerOptionsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((option, index) => {
        const isSelected = selectedAnswer === option.id;
        const showResult = isAnswered;
        const isCorrect = option.correct;

        return (
          <motion.button
            key={option.id}
            onClick={() => !disabled && !isAnswered && onSelect(option.id)}
            disabled={disabled || isAnswered}
            className={cn(
              'relative p-4 rounded-lg border-2 text-left transition-colors',
              'hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              !isAnswered && !isSelected && 'border-border bg-card',
              !isAnswered && isSelected && 'border-primary bg-primary/5',
              showResult && isCorrect && 'border-green-500 bg-green-500/10',
              showResult && isSelected && !isCorrect && 'border-red-500 bg-red-500/10',
              showResult && !isSelected && !isCorrect && 'opacity-50',
              (disabled || isAnswered) && 'cursor-default'
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={!disabled && !isAnswered ? { scale: 1.02 } : {}}
            whileTap={!disabled && !isAnswered ? { scale: 0.98 } : {}}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{option.label}</span>

              {showResult && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    'flex items-center justify-center w-6 h-6 rounded-full',
                    isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  )}
                >
                  {isCorrect ? (
                    <Check className="w-4 h-4" />
                  ) : isSelected ? (
                    <X className="w-4 h-4" />
                  ) : null}
                </motion.div>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
