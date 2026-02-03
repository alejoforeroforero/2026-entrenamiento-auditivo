'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music, ArrowLeft } from 'lucide-react';
import { Accordion, AccordionItem, Button, Chip } from '@heroui/react';
import { cn } from '@/lib/utils';

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
    <aside className="hidden md:block w-64 shrink-0 bg-content1/50 border-r border-divider">
      <div className="sticky top-16 px-3 py-4">
        <Button
          as={Link}
          href="/"
          variant="light"
          size="sm"
          startContent={<ArrowLeft className="w-4 h-4" />}
          className="mb-4 text-default-500 hover:text-foreground"
        >
          Cambiar género
        </Button>

        {!hasContent ? (
          <p className="text-sm text-default-500 px-3 py-2">
            No hay canciones en este género todavía.
          </p>
        ) : progressions.length === 0 ? (
          <p className="text-sm text-default-500 px-3 py-2">
            No hay progresiones disponibles.
          </p>
        ) : (
          <Accordion
            selectionMode="single"
            defaultSelectedKeys={[defaultOpenLevel]}
            className="px-0 gap-2"
            variant="light"
            itemClasses={{
              trigger: 'px-3 py-2 hover:bg-default-100 rounded-lg data-[hover=true]:bg-default-100',
              content: 'pb-2',
              title: 'text-sm font-medium',
            }}
          >
            {difficultyOrder.map((difficulty) => {
              const items = progressionsByDifficulty[difficulty];
              if (!items || items.length === 0) return null;

              return (
                <AccordionItem
                  key={difficulty}
                  aria-label={difficultyLabels[difficulty]}
                  title={
                    <div className="flex items-center justify-between w-full pr-2">
                      <span>{difficultyLabels[difficulty]}</span>
                      <Chip size="sm" variant="flat" color="default">
                        {items.length}
                      </Chip>
                    </div>
                  }
                >
                  <nav className="space-y-1">
                    {items.map((progression) => {
                      const isActive = pathname === `/${genre}/progresiones/${progression.id}`;
                      return (
                        <Link
                          key={progression.id}
                          href={`/${genre}/progresiones/${progression.id}`}
                          className={cn(
                            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                            isActive
                              ? 'bg-primary/15 text-primary shadow-sm'
                              : 'text-default-600 hover:text-foreground hover:bg-default-100'
                          )}
                        >
                          <Music className={cn('w-4 h-4 shrink-0', isActive && 'text-primary')} />
                          <span className="truncate">{progression.name}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
    </aside>
  );
}
