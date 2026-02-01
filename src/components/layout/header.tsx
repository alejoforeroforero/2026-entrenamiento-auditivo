'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Headphones, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';

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

  const navItems = currentGenre
    ? [{ href: `/${currentGenre}/progresiones`, label: 'Progresiones' }]
    : [];

  const ctaHref = currentGenre ? `/${currentGenre}/practicar` : '/';
  const ctaLabel = currentGenre ? 'Practicar' : 'Comenzar';

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 md:h-20 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/" className="flex items-center gap-2 md:gap-4 group">
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
        </div>

        {navItems.length > 0 && (
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-6 py-3 text-base font-semibold tracking-wide transition-all duration-200 rounded-xl',
                    isActive
                      ? 'text-foreground bg-secondary/60'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-2 md:gap-5">
          <ThemeToggle />

          <Link
            href={ctaHref}
            className="px-4 py-2 md:px-6 md:py-3 rounded-full bg-foreground text-background text-xs md:text-sm font-bold tracking-wide uppercase hover:opacity-90 transition-opacity"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
