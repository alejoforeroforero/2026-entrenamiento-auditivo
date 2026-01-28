import { RhythmPattern, RhythmStep, Genre } from '@/types/music';

// Helper to create rhythm steps
const createSteps = (pattern: string, subdivisions: number = 4): RhythmStep[] => {
  return pattern.split('').map((char, index) => ({
    beat: Math.floor(index / subdivisions) + 1,
    subdivision: (index % subdivisions) + 1,
    active: char === 'x' || char === 'X',
    accent: char === 'X',
  }));
};

export const rhythmPatterns: RhythmPattern[] = [
  // Cumbia patterns
  {
    id: 'cumbia-guira-basico',
    name: 'Güira de Cumbia',
    genre: 'cumbia',
    timeSignature: [4, 4],
    bpm: 90,
    instruments: [
      {
        instrument: 'guira',
        // X = accent, x = hit, . = rest
        pattern: createSteps('XxxXxXxxXxxXxXxx'),
      },
      {
        instrument: 'tambora',
        pattern: createSteps('X...x...X...x...'),
      },
      {
        instrument: 'llamador',
        pattern: createSteps('..x...x...x...x.'),
      },
    ],
    description: 'Patrón básico de cumbia con güira y tambora',
  },
  {
    id: 'cumbia-alegre',
    name: 'Cumbia Alegre',
    genre: 'cumbia',
    timeSignature: [4, 4],
    bpm: 95,
    instruments: [
      {
        instrument: 'alegre',
        pattern: createSteps('x.x.X.x.x.x.X.x.'),
      },
      {
        instrument: 'llamador',
        pattern: createSteps('..x...x...x...x.'),
      },
      {
        instrument: 'guira',
        pattern: createSteps('xxxxxxxxxxxxxxxx'),
      },
    ],
    description: 'Patrón de cumbia con tambor alegre',
  },

  // Vallenato patterns
  {
    id: 'vallenato-paseo',
    name: 'Paseo Vallenato',
    genre: 'vallenato',
    timeSignature: [2, 4],
    bpm: 130,
    instruments: [
      {
        instrument: 'caja',
        pattern: createSteps('X.x.x.X.'),
      },
      {
        instrument: 'guira',
        pattern: createSteps('xxxxxxxx'),
      },
    ],
    description: 'Ritmo de paseo vallenato, el más común del género',
  },
  {
    id: 'vallenato-merengue',
    name: 'Merengue Vallenato',
    genre: 'vallenato',
    timeSignature: [2, 4],
    bpm: 160,
    instruments: [
      {
        instrument: 'caja',
        pattern: createSteps('XxXxXxXx'),
      },
      {
        instrument: 'guira',
        pattern: createSteps('XxXxXxXx'),
      },
    ],
    description: 'Merengue vallenato, ritmo rápido y festivo',
  },
  {
    id: 'vallenato-son',
    name: 'Son Vallenato',
    genre: 'vallenato',
    timeSignature: [4, 4],
    bpm: 75,
    instruments: [
      {
        instrument: 'caja',
        pattern: createSteps('X...x.X.x...x.X.'),
      },
      {
        instrument: 'guira',
        pattern: createSteps('x.x.x.x.x.x.x.x.'),
      },
    ],
    description: 'Son vallenato, ritmo más lento y cadencioso',
  },

  // Bambuco patterns
  {
    id: 'bambuco-68',
    name: 'Bambuco 6/8',
    genre: 'bambuco',
    timeSignature: [6, 8],
    bpm: 120,
    instruments: [
      {
        instrument: 'guira',
        pattern: createSteps('X.x.x.X.x.x.', 3),
      },
    ],
    description: 'Bambuco en 6/8, ritmo tradicional andino',
  },
  {
    id: 'bambuco-sesquialtera',
    name: 'Bambuco Sesquiáltera',
    genre: 'bambuco',
    timeSignature: [6, 8],
    bpm: 110,
    instruments: [
      {
        instrument: 'guira',
        // Sesquiáltera: alternancia 3/4 y 6/8
        pattern: createSteps('X.x.x.x.X.x.', 3),
      },
    ],
    description: 'Bambuco con sesquiáltera (hemiola), alternancia rítmica característica',
  },
];

export const getRhythmsByGenre = (genre: Genre): RhythmPattern[] => {
  return rhythmPatterns.filter((r) => r.genre === genre);
};

export const getRhythmById = (id: string): RhythmPattern | undefined => {
  return rhythmPatterns.find((r) => r.id === id);
};

export const getRandomRhythm = (genre?: Genre): RhythmPattern => {
  const filtered = genre ? getRhythmsByGenre(genre) : rhythmPatterns;
  return filtered[Math.floor(Math.random() * filtered.length)];
};
