'use client';

import { cn } from '@/lib/utils';

interface QuizProgressProps {
  current: number;
  total: number;
  correct: number;
}

export function QuizProgress({ current, total, correct }: QuizProgressProps) {
  const percentage = ((current - 1) / total) * 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">
          Pregunta {current} de {total}
        </span>
        <span className="text-muted-foreground">
          {correct} correcta{correct !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            'bg-primary'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
