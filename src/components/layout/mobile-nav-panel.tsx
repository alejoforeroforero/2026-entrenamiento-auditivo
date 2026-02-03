'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Music } from 'lucide-react';
import { Accordion, AccordionItem } from '@heroui/react';
import { cn } from '@/lib/utils';
import { useMobileNavStore, ProgressionItem } from '@/stores/mobile-nav-store';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

const difficultyLabels: Record<Difficulty, string> = {
  beginner: 'Básico',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

const difficultyOrder: Difficulty[] = ['beginner', 'intermediate', 'advanced'];

export function MobileNavPanel() {
  const pathname = usePathname();
  const { isOpen, setIsOpen, genre, genreLabel, progressions, hasContent } =
    useMobileNavStore();

  if (!genre || !genreLabel) return null;

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

  const handleLinkClick = () => setIsOpen(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="md:hidden overflow-hidden bg-background border-b border-border/50"
        >
          <div className="px-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Género</span>
                <span className="text-sm font-semibold">{genreLabel}</span>
              </div>
              <Link
                href="/"
                onClick={handleLinkClick}
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Cambiar
              </Link>
            </div>

            <div className="border-t border-border/50 -mx-4 mb-4" />

            {!hasContent ? (
              <p className="text-sm text-muted-foreground py-2">
                No hay canciones en este género todavía.
              </p>
            ) : progressions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No hay progresiones disponibles.
              </p>
            ) : (
              <Accordion
                selectionMode="single"
                defaultSelectedKeys={[defaultOpenLevel]}
                className="space-y-1 px-0"
                variant="light"
              >
                {difficultyOrder.map((difficulty) => {
                  const items = progressionsByDifficulty[difficulty];
                  if (!items || items.length === 0) return null;

                  return (
                    <AccordionItem
                      key={difficulty}
                      aria-label={difficultyLabels[difficulty]}
                      title={
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm font-medium">{difficultyLabels[difficulty]}</span>
                          <span className="text-xs text-muted-foreground">
                            {items.length}
                          </span>
                        </div>
                      }
                      classNames={{
                        trigger: 'px-3 py-2 hover:bg-secondary/50 rounded-lg',
                        content: 'pb-1',
                      }}
                    >
                      <nav className="space-y-1 pl-2">
                        {items.map((progression) => {
                          const isActive =
                            pathname === `/${genre}/progresiones/${progression.id}`;
                          return (
                            <Link
                              key={progression.id}
                              href={`/${genre}/progresiones/${progression.id}`}
                              onClick={handleLinkClick}
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
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
