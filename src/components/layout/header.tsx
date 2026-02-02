'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Headphones, ChevronRight } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from '@/components/auth/user-menu';
import { MobileNavTrigger } from './mobile-nav-trigger';
import { MobileNavPanel } from './mobile-nav-panel';

const GENRE_LABELS: Record<string, string> = {
  salsa: 'Salsa',
  cumbia: 'Cumbia',
  vallenato: 'Vallenato',
  bambuco: 'Bambuco',
};

function extractGenreFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/([^/]+)/);
  if (!match) return null;
  const potentialGenre = match[1];
  return GENRE_LABELS[potentialGenre] ? potentialGenre : null;
}

export function Header() {
  const pathname = usePathname();
  const currentGenre = extractGenreFromPathname(pathname);
  const genreLabel = currentGenre ? GENRE_LABELS[currentGenre] : null;

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 md:h-20 items-center gap-3 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 md:gap-4 group shrink-0">
          <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-105">
            <Headphones className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <span className="text-xl md:text-2xl font-bold tracking-tight hidden sm:inline">
            Progresiones
          </span>
        </Link>

        {genreLabel && (
          <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">
              {genreLabel}
            </span>
          </div>
        )}

        {currentGenre && (
          <Link
            href={`/${currentGenre}/practicar`}
            className="px-4 py-2 md:px-6 md:py-3 rounded-full bg-foreground text-background text-xs md:text-sm font-bold tracking-wide uppercase hover:opacity-90 transition-opacity"
          >
            Practicar
          </Link>
        )}

        <div className="flex items-center gap-2 md:gap-5 shrink-0 ml-auto">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
      <MobileNavTrigger />
      <MobileNavPanel />
    </header>
  );
}
