'use client';

import { cn } from '@/lib/utils';

interface QuizAttemptsProps {
  used: number;
  max: number;
}

export function QuizAttempts({ used, max }: QuizAttemptsProps) {
  const remaining = max - used;

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">Intentos:</span>
      <div className="flex gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-2.5 h-2.5 rounded-full transition-colors',
              i < remaining ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        ({remaining} restante{remaining !== 1 ? 's' : ''})
      </span>
    </div>
  );
}
