'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GenreEntry {
  id: string;
  name: string;
  label: string;
}

interface GenreStore {
  genres: GenreEntry[];
  addGenre: (name: string, label: string) => GenreEntry | null;
  deleteGenre: (id: string) => void;
  getGenreById: (id: string) => GenreEntry | undefined;
}

export const useGenreStore = create<GenreStore>()(
  persist(
    (set, get) => ({
      genres: [],

      addGenre: (name, label) => {
        const id = name.toLowerCase().replace(/\s+/g, '-');

        // Check for duplicates
        if (get().genres.some((g) => g.id === id)) {
          return null;
        }

        const newGenre: GenreEntry = { id, name: id, label };
        set((state) => ({
          genres: [...state.genres, newGenre],
        }));
        return newGenre;
      },

      deleteGenre: (id) => {
        set((state) => ({
          genres: state.genres.filter((g) => g.id !== id),
        }));
      },

      getGenreById: (id) => {
        return get().genres.find((g) => g.id === id);
      },
    }),
    {
      name: 'ea-genres',
    }
  )
);
