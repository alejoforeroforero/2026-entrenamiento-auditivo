'use client';

import { usePathname } from 'next/navigation';
import { Music, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileNavStore } from '@/stores/mobile-nav-store';

export function MobileNavTrigger() {
  const pathname = usePathname();
  const { isOpen, setIsOpen, genre, genreLabel, progressions } = useMobileNavStore();

  if (!genre || !genreLabel) return null;

  const activeProgression = progressions.find(
    (p) => pathname === `/${genre}/progresiones/${p.id}`
  );

  const displayText = activeProgression?.name || 'Progresiones';

  return (
    <div className="md:hidden border-t border-border/50 bg-secondary/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Music className="w-4 h-4 shrink-0 text-primary" />
          <span className="truncate text-sm font-medium">{displayText}</span>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
    </div>
  );
}
