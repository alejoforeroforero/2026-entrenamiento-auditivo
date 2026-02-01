'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music, ArrowLeft, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

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

function SidebarContent({
  genre,
  genreLabel,
  progressions,
  hasContent,
  onLinkClick,
}: GenreSidebarProps & { onLinkClick?: () => void }) {
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
    <div className="px-4 md:px-6 py-6">
      <Link
        href="/"
        onClick={onLinkClick}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Cambiar género
      </Link>

      <div className="mb-6 px-1">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Género
        </span>
        <h2 className="text-lg font-semibold mt-1">
          {genreLabel}
        </h2>
      </div>

      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-1">
        Progresiones
      </h3>

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
                          onClick={onLinkClick}
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
  );
}

export function GenreSidebar(props: GenreSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile: floating menu button + sheet */}
      <div className="md:hidden fixed bottom-4 left-4 z-40">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg glow"
            >
              <Menu className="w-6 h-6" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 overflow-y-auto">
            <SheetHeader className="sr-only">
              <SheetTitle>Navegación</SheetTitle>
            </SheetHeader>
            <SidebarContent {...props} onLinkClick={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: fixed sidebar */}
      <aside className="hidden md:block w-64 shrink-0 bg-secondary/30 border-r border-border/50">
        <div className="sticky top-20">
          <SidebarContent {...props} />
        </div>
      </aside>
    </>
  );
}
