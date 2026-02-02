'use client';

import { create } from 'zustand';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ProgressionItem {
  id: string;
  name: string;
  difficulty: Difficulty;
}

interface MobileNavState {
  isOpen: boolean;
  genre: string | null;
  genreLabel: string | null;
  progressions: ProgressionItem[];
  hasContent: boolean;
  setIsOpen: (open: boolean) => void;
  setNavData: (data: {
    genre: string;
    genreLabel: string;
    progressions: ProgressionItem[];
    hasContent: boolean;
  }) => void;
  clearNavData: () => void;
}

export const useMobileNavStore = create<MobileNavState>((set) => ({
  isOpen: false,
  genre: null,
  genreLabel: null,
  progressions: [],
  hasContent: false,
  setIsOpen: (open) => set({ isOpen: open }),
  setNavData: (data) => set({ ...data, isOpen: false }),
  clearNavData: () =>
    set({
      genre: null,
      genreLabel: null,
      progressions: [],
      hasContent: false,
      isOpen: false,
    }),
}));
