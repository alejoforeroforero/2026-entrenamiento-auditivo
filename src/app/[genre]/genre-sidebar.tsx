'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface ProgressionItem {
  id: string;
  name: string;
  difficulty: Difficulty;
}

interface GenreSidebarProps {
  genre: string;
  genreLabel: string;
  progressions: ProgressionItem[];
  hasContent: boolean;
}

const difficultyLabels: Record<Difficulty, string> = {
  beginner: 'Básico',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

const difficultyOrder: Difficulty[] = ['beginner', 'intermediate', 'advanced'];

export function GenreSidebar({
  genre,
  genreLabel,
  progressions,
  hasContent,
}: GenreSidebarProps) {
  const pathname = usePathname();

  const progressionsByDifficulty = progressions.reduce(
    (acc, progression) => {
      const difficulty = progression.difficulty;
      if (!acc[difficulty]) {
        acc[difficulty] = [];
      }
      acc[difficulty].push(progression);
      return acc;
    },
    {} as Record<Difficulty, ProgressionItem[]>
  );

  const activeProgression = progressions.find(
    (p) => pathname === `/${genre}/progresiones/${p.id}`
  );
  const defaultOpenLevel = activeProgression?.difficulty || 'beginner';

  return (
    <aside className="hidden md:block w-64 shrink-0 bg-secondary/30 border-r border-border/50">
      <div className="sticky top-20 px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Cambiar género
        </Link>

        {!hasContent ? (
          <p className="text-sm text-muted-foreground px-3 py-2">
            No hay canciones en este género todavía.
          </p>
        ) : progressions.length === 0 ? (
          <p className="text-sm text-muted-foreground px-3 py-2">
            No hay progresiones disponibles.
          </p>
        ) : (
          <Accordion
            type="single"
            collapsible
            defaultValue={defaultOpenLevel}
            className="space-y-1"
          >
            {difficultyOrder.map((difficulty) => {
              const items = progressionsByDifficulty[difficulty];
              if (!items || items.length === 0) return null;

              return (
                <AccordionItem
                  key={difficulty}
                  value={difficulty}
                  className="border-none"
                >
                  <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-secondary/50 rounded-lg text-sm font-medium">
                    {difficultyLabels[difficulty]}
                    <span className="text-xs text-muted-foreground ml-auto mr-2">
                      {items.length}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-1">
                    <nav className="space-y-1 pl-2">
                      {items.map((progression) => {
                        const isActive = pathname === `/${genre}/progresiones/${progression.id}`;
                        return (
                          <Link
                            key={progression.id}
                            href={`/${genre}/progresiones/${progression.id}`}
                            className={cn(
                              'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                              isActive
                                ? 'bg-primary/15 text-primary glow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                            )}
                          >
                            <Music className="w-4 h-4 shrink-0" />
                            <span className="truncate">{progression.name}</span>
                          </Link>
                        );
                      })}
                    </nav>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
    </aside>
  );
}
