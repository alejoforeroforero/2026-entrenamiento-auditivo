import { Genre, RomanNumeral, NoteName } from './music';

export interface RepertoireEntry {
  id: string;
  title: string;
  artist: string;
  genre: Genre;
  progressionId: string; // Reference to progression
  progression: RomanNumeral[]; // Stored for quick access
  key: NoteName;
  mode: 'major' | 'minor';
  youtubeId: string;
  youtubeUrl: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  year?: number;
  description?: string;
  startTime?: number; // Start time in seconds
  duration?: number; // Duration in seconds (default 10)
  createdAt: number;
}

export interface RepertoireFormData {
  title: string;
  artist: string;
  genre: Genre;
  progressionId: string;
  key: NoteName;
  mode: 'major' | 'minor';
  youtubeUrl: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  year?: number;
  description?: string;
}
