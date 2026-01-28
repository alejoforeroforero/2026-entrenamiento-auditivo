'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Chord, Note, NoteName } from '@/types/music';

interface PianoVisualizationProps {
  chords?: Chord[];
  currentChordIndex: number;
  highlightedNotes?: Note[];
  startOctave?: number;
  numOctaves?: number;
}

const WHITE_KEYS: NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_KEYS: NoteName[] = ['C#', 'D#', 'F#', 'G#', 'A#'];

const BLACK_KEY_POSITIONS: Record<string, number> = {
  'C#': 1,
  'D#': 2,
  'F#': 4,
  'G#': 5,
  'A#': 6,
};

function extractNoteName(note: Note): { name: NoteName; octave: number } {
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) return { name: 'C', octave: 4 };
  return { name: match[1] as NoteName, octave: parseInt(match[2]) };
}

function isNoteActive(note: Note, activeNotes: Note[]): boolean {
  return activeNotes.some(n => n === note);
}

export function PianoVisualization({
  chords = [],
  currentChordIndex,
  highlightedNotes,
  startOctave = 3,
  numOctaves = 2,
}: PianoVisualizationProps) {
  // Get currently active notes
  const activeNotes: Note[] =
    highlightedNotes ||
    (currentChordIndex >= 0 && currentChordIndex < chords.length
      ? chords[currentChordIndex].notes
      : []);

  const octaves = Array.from({ length: numOctaves }, (_, i) => startOctave + i);

  return (
    <div className="relative select-none">
      {/* Chord progression indicator */}
      {chords.length > 0 && (
        <div className="flex justify-center gap-2 mb-4">
          {chords.map((chord, index) => (
            <motion.div
              key={index}
              className={cn(
                'px-3 py-1 rounded text-sm font-medium transition-colors',
                index === currentChordIndex
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
              animate={{
                scale: index === currentChordIndex ? 1.1 : 1,
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {chord.root}
              {chord.quality === 'minor' && 'm'}
              {chord.quality === 'diminished' && '°'}
              {chord.quality === 'dominant7' && '7'}
            </motion.div>
          ))}
        </div>
      )}

      {/* Piano keyboard */}
      <div className="flex justify-center">
        <div className="relative inline-flex">
          {octaves.map((octave) => (
            <div key={octave} className="relative flex">
              {/* White keys */}
              {WHITE_KEYS.map((noteName, keyIndex) => {
                const note = `${noteName}${octave}` as Note;
                const isActive = isNoteActive(note, activeNotes);

                return (
                  <motion.div
                    key={note}
                    className={cn(
                      'w-10 h-32 border border-gray-300 rounded-b-md relative',
                      'bg-white hover:bg-gray-50',
                      isActive && 'bg-primary/20'
                    )}
                    animate={{
                      backgroundColor: isActive ? 'hsl(var(--primary) / 0.3)' : '#fff',
                    }}
                    transition={{ duration: 0.1 }}
                  >
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-400">
                      {noteName}
                      {noteName === 'C' && <sub>{octave}</sub>}
                    </span>
                  </motion.div>
                );
              })}

              {/* Black keys */}
              {BLACK_KEYS.map((noteName) => {
                const note = `${noteName}${octave}` as Note;
                const isActive = isNoteActive(note, activeNotes);
                const position = BLACK_KEY_POSITIONS[noteName];

                return (
                  <motion.div
                    key={note}
                    className={cn(
                      'absolute w-6 h-20 rounded-b-md z-10',
                      'bg-gray-900 hover:bg-gray-800',
                      isActive && 'bg-primary'
                    )}
                    style={{
                      left: `${position * 40 - 12}px`,
                    }}
                    animate={{
                      backgroundColor: isActive ? 'hsl(var(--primary))' : '#111',
                    }}
                    transition={{ duration: 0.1 }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
