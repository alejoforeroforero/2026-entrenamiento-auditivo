'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressionItem {
  id: string;
  name: string;
}

interface GenreSidebarProps {
  genre: string;
  genreLabel: string;
  progressions: ProgressionItem[];
  hasContent: boolean;
}

export function GenreSidebar({
  genre,
  genreLabel,
  progressions,
  hasContent,
}: GenreSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-secondary/30 border-r border-border/50">
      <div className="sticky top-24 px-6 py-6">
        <Link
          href="/"
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
          <nav className="space-y-1">
            {progressions.map((progression) => {
              const isActive = pathname === `/${genre}/progresiones/${progression.id}`;
              return (
                <Link
                  key={progression.id}
                  href={`/${genre}/progresiones/${progression.id}`}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
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
        )}
      </div>
    </aside>
  );
}
