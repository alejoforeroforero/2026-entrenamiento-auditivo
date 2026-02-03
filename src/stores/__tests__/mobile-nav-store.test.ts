import { act } from '@testing-library/react';
import { useMobileNavStore, ProgressionItem } from '../mobile-nav-store';

const mockProgressions: ProgressionItem[] = [
  { id: 'prog-1', name: 'I-IV-V-I', difficulty: 'beginner' },
  { id: 'prog-2', name: 'I-V-vi-IV', difficulty: 'beginner' },
  { id: 'prog-3', name: 'ii-V-I', difficulty: 'intermediate' },
  { id: 'prog-4', name: 'I-vi-IV-V', difficulty: 'advanced' },
];

describe('mobile-nav-store', () => {
  beforeEach(() => {
    act(() => {
      useMobileNavStore.getState().clearNavData();
    });
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useMobileNavStore.getState();

      expect(state.isOpen).toBe(false);
      expect(state.genre).toBeNull();
      expect(state.genreLabel).toBeNull();
      expect(state.progressions).toEqual([]);
      expect(state.hasContent).toBe(false);
    });
  });

  describe('setIsOpen', () => {
    it('should set isOpen to true', () => {
      act(() => {
        useMobileNavStore.getState().setIsOpen(true);
      });

      expect(useMobileNavStore.getState().isOpen).toBe(true);
    });

    it('should set isOpen to false', () => {
      act(() => {
        useMobileNavStore.getState().setIsOpen(true);
        useMobileNavStore.getState().setIsOpen(false);
      });

      expect(useMobileNavStore.getState().isOpen).toBe(false);
    });
  });

  describe('setNavData', () => {
    it('should set all navigation data', () => {
      act(() => {
        useMobileNavStore.getState().setNavData({
          genre: 'salsa',
          genreLabel: 'Salsa',
          progressions: mockProgressions,
          hasContent: true,
        });
      });

      const state = useMobileNavStore.getState();
      expect(state.genre).toBe('salsa');
      expect(state.genreLabel).toBe('Salsa');
      expect(state.progressions).toEqual(mockProgressions);
      expect(state.hasContent).toBe(true);
    });

    it('should close nav when setting data', () => {
      act(() => {
        useMobileNavStore.getState().setIsOpen(true);
        useMobileNavStore.getState().setNavData({
          genre: 'cumbia',
          genreLabel: 'Cumbia',
          progressions: [],
          hasContent: false,
        });
      });

      expect(useMobileNavStore.getState().isOpen).toBe(false);
    });

    it('should replace existing data', () => {
      act(() => {
        useMobileNavStore.getState().setNavData({
          genre: 'salsa',
          genreLabel: 'Salsa',
          progressions: mockProgressions,
          hasContent: true,
        });
        useMobileNavStore.getState().setNavData({
          genre: 'vallenato',
          genreLabel: 'Vallenato',
          progressions: [mockProgressions[0]],
          hasContent: true,
        });
      });

      const state = useMobileNavStore.getState();
      expect(state.genre).toBe('vallenato');
      expect(state.genreLabel).toBe('Vallenato');
      expect(state.progressions).toHaveLength(1);
    });
  });

  describe('clearNavData', () => {
    it('should reset all data to initial state', () => {
      act(() => {
        useMobileNavStore.getState().setNavData({
          genre: 'salsa',
          genreLabel: 'Salsa',
          progressions: mockProgressions,
          hasContent: true,
        });
        useMobileNavStore.getState().setIsOpen(true);
        useMobileNavStore.getState().clearNavData();
      });

      const state = useMobileNavStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.genre).toBeNull();
      expect(state.genreLabel).toBeNull();
      expect(state.progressions).toEqual([]);
      expect(state.hasContent).toBe(false);
    });
  });

  describe('progression items', () => {
    it('should store progressions with all difficulty levels', () => {
      act(() => {
        useMobileNavStore.getState().setNavData({
          genre: 'salsa',
          genreLabel: 'Salsa',
          progressions: mockProgressions,
          hasContent: true,
        });
      });

      const progressions = useMobileNavStore.getState().progressions;
      const difficulties = progressions.map(p => p.difficulty);

      expect(difficulties).toContain('beginner');
      expect(difficulties).toContain('intermediate');
      expect(difficulties).toContain('advanced');
    });

    it('should handle empty progressions', () => {
      act(() => {
        useMobileNavStore.getState().setNavData({
          genre: 'bambuco',
          genreLabel: 'Bambuco',
          progressions: [],
          hasContent: false,
        });
      });

      const state = useMobileNavStore.getState();
      expect(state.progressions).toEqual([]);
      expect(state.hasContent).toBe(false);
    });
  });

  describe('state independence', () => {
    it('should allow isOpen to be changed without affecting other data', () => {
      act(() => {
        useMobileNavStore.getState().setNavData({
          genre: 'salsa',
          genreLabel: 'Salsa',
          progressions: mockProgressions,
          hasContent: true,
        });
        useMobileNavStore.getState().setIsOpen(true);
      });

      const state = useMobileNavStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.genre).toBe('salsa');
      expect(state.progressions).toEqual(mockProgressions);
    });
  });
});
