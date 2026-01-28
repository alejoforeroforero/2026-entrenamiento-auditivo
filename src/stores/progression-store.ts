'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RomanNumeral } from '@/types/music';

export interface StoredProgression {
  id: string;
  name: string;
  numerals: RomanNumeral[];
  description?: string;
}

interface ProgressionStore {
  progressions: StoredProgression[];
  addProgression: (progression: Omit<StoredProgression, 'id'>) => StoredProgression;
  deleteProgression: (id: string) => void;
  getProgressionById: (id: string) => StoredProgression | undefined;
}

function generateProgressionId(numerals: RomanNumeral[]): string {
  const numeralsStr = numerals.join('-').toLowerCase().replace(/\s/g, '');
  return `prog-${numeralsStr}-${Date.now()}`;
}

export const useProgressionStore = create<ProgressionStore>()(
  persist(
    (set, get) => ({
      progressions: [],

      addProgression: (progressionData) => {
        const newProgression: StoredProgression = {
          ...progressionData,
          id: generateProgressionId(progressionData.numerals),
        };
        set((state) => ({
          progressions: [...state.progressions, newProgression],
        }));
        return newProgression;
      },

      deleteProgression: (id) => {
        set((state) => ({
          progressions: state.progressions.filter((p) => p.id !== id),
        }));
      },

      getProgressionById: (id) => {
        return get().progressions.find((p) => p.id === id);
      },
    }),
    {
      name: 'ea-progressions',
    }
  )
);
