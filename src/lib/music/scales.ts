import { NoteName, ChordQuality, Chord, Note, RomanNumeral } from '@/types/music';

// All notes in chromatic order
const CHROMATIC_NOTES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Enharmonic mappings
const ENHARMONIC_MAP: Record<string, NoteName> = {
  'Db': 'C#',
  'Eb': 'D#',
  'Gb': 'F#',
  'Ab': 'G#',
  'Bb': 'A#',
};

// Scale intervals (in semitones from root)
const SCALE_INTERVALS = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
};

// Chord intervals (in semitones from root)
const CHORD_INTERVALS: Record<ChordQuality, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  dominant7: [0, 4, 7, 10],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
};

// Roman numeral to scale degree and quality (for major keys)
const MAJOR_KEY_CHORDS: Record<RomanNumeral, { degree: number; quality: ChordQuality }> = {
  'I': { degree: 0, quality: 'major' },
  'i': { degree: 0, quality: 'minor' },
  'II': { degree: 1, quality: 'major' },
  'ii': { degree: 1, quality: 'minor' },
  'III': { degree: 2, quality: 'major' },
  'iii': { degree: 2, quality: 'minor' },
  'IV': { degree: 3, quality: 'major' },
  'iv': { degree: 3, quality: 'minor' },
  'V': { degree: 4, quality: 'major' },
  'v': { degree: 4, quality: 'minor' },
  'VI': { degree: 5, quality: 'major' },
  'vi': { degree: 5, quality: 'minor' },
  'VII': { degree: 6, quality: 'major' },
  'vii': { degree: 6, quality: 'minor' },
  'viio': { degree: 6, quality: 'diminished' },
};

/**
 * Get the index of a note in the chromatic scale
 */
export function getNoteIndex(note: NoteName): number {
  const normalized = ENHARMONIC_MAP[note] || note;
  return CHROMATIC_NOTES.indexOf(normalized);
}

/**
 * Get a note by chromatic index
 */
export function getNoteByIndex(index: number): NoteName {
  return CHROMATIC_NOTES[((index % 12) + 12) % 12];
}

/**
 * Transpose a note by a number of semitones
 */
export function transposeNote(note: NoteName, semitones: number): NoteName {
  const index = getNoteIndex(note);
  return getNoteByIndex(index + semitones);
}

/**
 * Get the notes of a scale
 */
export function getScaleNotes(root: NoteName, mode: 'major' | 'minor' | 'harmonicMinor'): NoteName[] {
  const rootIndex = getNoteIndex(root);
  const intervals = SCALE_INTERVALS[mode];
  return intervals.map((interval) => getNoteByIndex(rootIndex + interval));
}

/**
 * Get the chord tones for a chord quality from a root
 */
export function getChordNotes(root: NoteName, quality: ChordQuality, octave: number = 4): Note[] {
  const rootIndex = getNoteIndex(root);
  const intervals = CHORD_INTERVALS[quality];

  return intervals.map((interval, i) => {
    const noteIndex = (rootIndex + interval) % 12;
    const noteOctave = octave + Math.floor((rootIndex + interval) / 12);
    return `${CHROMATIC_NOTES[noteIndex]}${noteOctave}` as Note;
  });
}

/**
 * Build a chord from a roman numeral in a given key
 */
export function buildChordFromNumeral(
  key: NoteName,
  numeral: RomanNumeral,
  mode: 'major' | 'minor',
  octave: number = 4
): Chord {
  const scaleNotes = getScaleNotes(key, mode);
  const { degree, quality } = MAJOR_KEY_CHORDS[numeral];
  const root = scaleNotes[degree];

  return {
    root,
    quality,
    notes: getChordNotes(root, quality, octave),
  };
}

/**
 * Build all chords for a progression in a given key
 */
export function buildProgression(
  key: NoteName,
  numerals: RomanNumeral[],
  mode: 'major' | 'minor',
  octave: number = 4
): Chord[] {
  return numerals.map((numeral) => buildChordFromNumeral(key, numeral, mode, octave));
}

/**
 * Get a random key for practice
 */
export function getRandomKey(): NoteName {
  // Use more common keys for ear training
  const commonKeys: NoteName[] = ['C', 'G', 'D', 'A', 'E', 'F', 'Bb'];
  return commonKeys[Math.floor(Math.random() * commonKeys.length)];
}
