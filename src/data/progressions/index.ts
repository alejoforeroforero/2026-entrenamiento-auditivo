import { Progression, Genre } from '@/types/music';

export const progressions: Progression[] = [
  // Cumbia progressions
  {
    id: 'cumbia-1-4-5-1',
    name: 'I-IV-V-I',
    numerals: ['I', 'IV', 'V', 'I'],
    genre: 'cumbia',
    description: 'Progresión básica de cumbia, muy común en temas tradicionales',
  },
  {
    id: 'cumbia-1-5-4-1',
    name: 'I-V-IV-I',
    numerals: ['I', 'V', 'IV', 'I'],
    genre: 'cumbia',
    description: 'Variante común en cumbia moderna',
  },
  {
    id: 'cumbia-minor-1-4-5-1',
    name: 'i-iv-V-i',
    numerals: ['i', 'iv', 'V', 'i'],
    genre: 'cumbia',
    description: 'Progresión menor característica de cumbias melancólicas',
  },
  {
    id: 'cumbia-1-4-1-5',
    name: 'I-IV-I-V',
    numerals: ['I', 'IV', 'I', 'V'],
    genre: 'cumbia',
    description: 'Patrón de cumbia con cadencia suspendida',
  },

  // Vallenato progressions
  {
    id: 'vallenato-1-5',
    name: 'I-V',
    numerals: ['I', 'V', 'I', 'V'],
    genre: 'vallenato',
    description: 'Progresión tradicional del vallenato clásico',
  },
  {
    id: 'vallenato-1-4-5-1',
    name: 'I-IV-V-I',
    numerals: ['I', 'IV', 'V', 'I'],
    genre: 'vallenato',
    description: 'Cadencia perfecta en vallenato',
  },
  {
    id: 'vallenato-1-4-1-5',
    name: 'I-IV-I-V',
    numerals: ['I', 'IV', 'I', 'V'],
    genre: 'vallenato',
    description: 'Variante con mayor movimiento armónico',
  },
  {
    id: 'vallenato-6m-4-1-5',
    name: 'vi-IV-I-V',
    numerals: ['vi', 'IV', 'I', 'V'],
    genre: 'vallenato',
    description: 'Progresión moderna del vallenato romántico',
  },

  // Bambuco progressions
  {
    id: 'bambuco-1-4-5-1',
    name: 'I-IV-V-I',
    numerals: ['I', 'IV', 'V', 'I'],
    genre: 'bambuco',
    description: 'Cadencia clásica del bambuco',
  },
  {
    id: 'bambuco-1-2m-5-1',
    name: 'I-ii-V-I',
    numerals: ['I', 'ii', 'V', 'I'],
    genre: 'bambuco',
    description: 'Progresión con supertónica, elegante en bambuco',
  },
  {
    id: 'bambuco-1-6m-4-5',
    name: 'I-vi-IV-V',
    numerals: ['I', 'vi', 'IV', 'V'],
    genre: 'bambuco',
    description: 'Progresión del pop-bambuco',
  },
  {
    id: 'bambuco-minor-1-4-5-1',
    name: 'i-iv-V-i',
    numerals: ['i', 'iv', 'V', 'i'],
    genre: 'bambuco',
    description: 'Bambuco en modo menor, nostálgico',
  },
];

export const getProgressionsByGenre = (genre: Genre): Progression[] => {
  return progressions.filter((p) => p.genre === genre);
};

export const getProgressionById = (id: string): Progression | undefined => {
  return progressions.find((p) => p.id === id);
};

export const getRandomProgression = (genre?: Genre): Progression => {
  const filtered = genre ? getProgressionsByGenre(genre) : progressions;
  return filtered[Math.floor(Math.random() * filtered.length)];
};
