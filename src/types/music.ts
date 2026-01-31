// Genres
export type Genre = 'salsa' | 'cumbia' | 'vallenato' | 'bambuco';

// Musical notes
export type NoteName = 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B';
export type Octave = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type Note = `${NoteName}${Octave}`;

// Chord types
export type ChordQuality = 'major' | 'minor' | 'diminished' | 'augmented' | 'dominant7' | 'major7' | 'minor7';

export interface Chord {
  root: NoteName;
  quality: ChordQuality;
  notes: Note[];
}

// Roman numeral analysis
export type RomanNumeral = 'I' | 'i' | 'II' | 'ii' | 'III' | 'iii' | 'IV' | 'iv' | 'V' | 'v' | 'VI' | 'vi' | 'VII' | 'vii' | 'viio';

// Progression
export interface Progression {
  id: string;
  name: string;
  numerals: RomanNumeral[];
  description?: string;
}

export interface ProgressionInKey {
  progression: Progression;
  key: NoteName;
  mode: 'major' | 'minor';
  chords: Chord[];
}

// Rhythm patterns
export type RhythmInstrument = 'guira' | 'tambora' | 'caja' | 'llamador' | 'alegre' | 'maracas';

export interface RhythmStep {
  beat: number;
  subdivision: number;
  active: boolean;
  accent?: boolean;
}

export interface RhythmPattern {
  id: string;
  name: string;
  genre: Genre;
  timeSignature: [number, number]; // [beats, note value]
  bpm: number;
  instruments: {
    instrument: RhythmInstrument;
    pattern: RhythmStep[];
  }[];
  description?: string;
}

// Repertoire
export interface Song {
  id: string;
  title: string;
  artist: string;
  genreId: string;
  progressionId: string;
  key: NoteName;
  mode: 'major' | 'minor';
  year?: number;
  description?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  youtubeId?: string;
  startTime?: number;
  duration?: number;
}

// Exercise types
export type ExerciseType = 'progression' | 'rhythm' | 'melodic-dictation';

export interface ExerciseOption {
  id: string;
  label: string;
  value: string;
  correct: boolean;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  genre?: Genre;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  options: ExerciseOption[];
  correctAnswer: string;
}

export interface ProgressionExercise extends Exercise {
  type: 'progression';
  progression: ProgressionInKey;
}

export interface RhythmExercise extends Exercise {
  type: 'rhythm';
  pattern: RhythmPattern;
}

// User progress
export interface ExerciseResult {
  exerciseId: string;
  type: ExerciseType;
  genre?: Genre;
  correct: boolean;
  timestamp: number;
  responseTime: number; // in ms
}

export interface UserProgress {
  totalExercises: number;
  correctAnswers: number;
  streak: number;
  bestStreak: number;
  accuracy: number;
  exercisesByType: Record<ExerciseType, { total: number; correct: number }>;
  exercisesByGenre: Record<Genre, { total: number; correct: number }>;
  recentResults: ExerciseResult[];
  lastPracticed?: number;
}

// Audio state
export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  tempo: number;
  currentBeat: number;
  totalBeats: number;
}
