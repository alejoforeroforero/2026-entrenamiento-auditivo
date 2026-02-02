'use client';

import { useEffect } from 'react';
import { useMobileNavStore, ProgressionItem } from '@/stores/mobile-nav-store';

interface MobileNavSyncProps {
  genre: string;
  genreLabel: string;
  progressions: ProgressionItem[];
  hasContent: boolean;
}

export function MobileNavSync({
  genre,
  genreLabel,
  progressions,
  hasContent,
}: MobileNavSyncProps) {
  const setNavData = useMobileNavStore((state) => state.setNavData);
  const clearNavData = useMobileNavStore((state) => state.clearNavData);

  useEffect(() => {
    setNavData({ genre, genreLabel, progressions, hasContent });

    return () => {
      clearNavData();
    };
  }, [genre, genreLabel, progressions, hasContent, setNavData, clearNavData]);

  return null;
}
