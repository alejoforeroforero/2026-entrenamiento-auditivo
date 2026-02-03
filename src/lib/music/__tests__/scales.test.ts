import {
  getNoteIndex,
  getNoteByIndex,
  transposeNote,
  getScaleNotes,
  getChordNotes,
  buildChordFromNumeral,
  buildProgression,
  getRandomKey,
} from '../scales';

describe('scales', () => {
  describe('getNoteIndex', () => {
    it('should return correct index for natural notes', () => {
      expect(getNoteIndex('C')).toBe(0);
      expect(getNoteIndex('D')).toBe(2);
      expect(getNoteIndex('E')).toBe(4);
      expect(getNoteIndex('F')).toBe(5);
      expect(getNoteIndex('G')).toBe(7);
      expect(getNoteIndex('A')).toBe(9);
      expect(getNoteIndex('B')).toBe(11);
    });

    it('should return correct index for sharp notes', () => {
      expect(getNoteIndex('C#')).toBe(1);
      expect(getNoteIndex('D#')).toBe(3);
      expect(getNoteIndex('F#')).toBe(6);
      expect(getNoteIndex('G#')).toBe(8);
      expect(getNoteIndex('A#')).toBe(10);
    });

    it('should handle enharmonic equivalents (flats)', () => {
      expect(getNoteIndex('Db')).toBe(1);
      expect(getNoteIndex('Eb')).toBe(3);
      expect(getNoteIndex('Gb')).toBe(6);
      expect(getNoteIndex('Ab')).toBe(8);
      expect(getNoteIndex('Bb')).toBe(10);
    });

    it('should return same index for enharmonic pairs', () => {
      expect(getNoteIndex('C#')).toBe(getNoteIndex('Db'));
      expect(getNoteIndex('D#')).toBe(getNoteIndex('Eb'));
      expect(getNoteIndex('F#')).toBe(getNoteIndex('Gb'));
      expect(getNoteIndex('G#')).toBe(getNoteIndex('Ab'));
      expect(getNoteIndex('A#')).toBe(getNoteIndex('Bb'));
    });
  });

  describe('getNoteByIndex', () => {
    it('should return correct note for indices 0-11', () => {
      expect(getNoteByIndex(0)).toBe('C');
      expect(getNoteByIndex(1)).toBe('C#');
      expect(getNoteByIndex(2)).toBe('D');
      expect(getNoteByIndex(3)).toBe('D#');
      expect(getNoteByIndex(4)).toBe('E');
      expect(getNoteByIndex(5)).toBe('F');
      expect(getNoteByIndex(6)).toBe('F#');
      expect(getNoteByIndex(7)).toBe('G');
      expect(getNoteByIndex(8)).toBe('G#');
      expect(getNoteByIndex(9)).toBe('A');
      expect(getNoteByIndex(10)).toBe('A#');
      expect(getNoteByIndex(11)).toBe('B');
    });

    it('should wrap around for indices >= 12', () => {
      expect(getNoteByIndex(12)).toBe('C');
      expect(getNoteByIndex(13)).toBe('C#');
      expect(getNoteByIndex(14)).toBe('D');
      expect(getNoteByIndex(24)).toBe('C');
    });

    it('should handle negative indices', () => {
      expect(getNoteByIndex(-1)).toBe('B');
      expect(getNoteByIndex(-2)).toBe('A#');
      expect(getNoteByIndex(-12)).toBe('C');
    });
  });

  describe('transposeNote', () => {
    it('should transpose up by semitones', () => {
      expect(transposeNote('C', 1)).toBe('C#');
      expect(transposeNote('C', 2)).toBe('D');
      expect(transposeNote('C', 7)).toBe('G');
      expect(transposeNote('C', 12)).toBe('C');
    });

    it('should transpose down by negative semitones', () => {
      expect(transposeNote('C', -1)).toBe('B');
      expect(transposeNote('C', -2)).toBe('A#');
      expect(transposeNote('D', -2)).toBe('C');
    });

    it('should handle transposition from sharps', () => {
      expect(transposeNote('F#', 1)).toBe('G');
      expect(transposeNote('C#', 2)).toBe('D#');
    });

    it('should handle transposition from flats', () => {
      expect(transposeNote('Bb', 1)).toBe('B');
      expect(transposeNote('Eb', 2)).toBe('F');
    });

    it('should wrap around octave correctly', () => {
      expect(transposeNote('G', 7)).toBe('D');
      expect(transposeNote('A', 5)).toBe('D');
    });

    it('should return same note for 0 semitones', () => {
      expect(transposeNote('C', 0)).toBe('C');
      expect(transposeNote('F#', 0)).toBe('F#');
    });
  });

  describe('getScaleNotes', () => {
    describe('major scale', () => {
      it('should return C major scale notes', () => {
        const scale = getScaleNotes('C', 'major');
        expect(scale).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
      });

      it('should return G major scale notes', () => {
        const scale = getScaleNotes('G', 'major');
        expect(scale).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F#']);
      });

      it('should return D major scale notes', () => {
        const scale = getScaleNotes('D', 'major');
        expect(scale).toEqual(['D', 'E', 'F#', 'G', 'A', 'B', 'C#']);
      });

      it('should return F major scale notes', () => {
        const scale = getScaleNotes('F', 'major');
        expect(scale).toEqual(['F', 'G', 'A', 'A#', 'C', 'D', 'E']);
      });
    });

    describe('minor scale', () => {
      it('should return A minor scale notes (natural minor)', () => {
        const scale = getScaleNotes('A', 'minor');
        expect(scale).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
      });

      it('should return E minor scale notes', () => {
        const scale = getScaleNotes('E', 'minor');
        expect(scale).toEqual(['E', 'F#', 'G', 'A', 'B', 'C', 'D']);
      });

      it('should return D minor scale notes', () => {
        const scale = getScaleNotes('D', 'minor');
        expect(scale).toEqual(['D', 'E', 'F', 'G', 'A', 'A#', 'C']);
      });
    });

    describe('harmonic minor scale', () => {
      it('should return A harmonic minor scale notes', () => {
        const scale = getScaleNotes('A', 'harmonicMinor');
        expect(scale).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G#']);
      });

      it('should return E harmonic minor scale notes', () => {
        const scale = getScaleNotes('E', 'harmonicMinor');
        expect(scale).toEqual(['E', 'F#', 'G', 'A', 'B', 'C', 'D#']);
      });
    });

    it('should return 7 notes for any scale', () => {
      expect(getScaleNotes('C', 'major')).toHaveLength(7);
      expect(getScaleNotes('A', 'minor')).toHaveLength(7);
      expect(getScaleNotes('E', 'harmonicMinor')).toHaveLength(7);
    });
  });

  describe('getChordNotes', () => {
    describe('major chord', () => {
      it('should return C major chord notes', () => {
        const notes = getChordNotes('C', 'major', 4);
        expect(notes).toEqual(['C4', 'E4', 'G4']);
      });

      it('should return G major chord notes', () => {
        const notes = getChordNotes('G', 'major', 4);
        expect(notes).toEqual(['G4', 'B4', 'D5']);
      });
    });

    describe('minor chord', () => {
      it('should return A minor chord notes', () => {
        const notes = getChordNotes('A', 'minor', 4);
        expect(notes).toEqual(['A4', 'C5', 'E5']);
      });

      it('should return E minor chord notes', () => {
        const notes = getChordNotes('E', 'minor', 4);
        expect(notes).toEqual(['E4', 'G4', 'B4']);
      });
    });

    describe('diminished chord', () => {
      it('should return B diminished chord notes', () => {
        const notes = getChordNotes('B', 'diminished', 4);
        expect(notes).toEqual(['B4', 'D5', 'F5']);
      });
    });

    describe('augmented chord', () => {
      it('should return C augmented chord notes', () => {
        const notes = getChordNotes('C', 'augmented', 4);
        expect(notes).toEqual(['C4', 'E4', 'G#4']);
      });
    });

    describe('seventh chords', () => {
      it('should return G dominant 7 chord notes', () => {
        const notes = getChordNotes('G', 'dominant7', 4);
        expect(notes).toEqual(['G4', 'B4', 'D5', 'F5']);
      });

      it('should return C major 7 chord notes', () => {
        const notes = getChordNotes('C', 'major7', 4);
        expect(notes).toEqual(['C4', 'E4', 'G4', 'B4']);
      });

      it('should return A minor 7 chord notes', () => {
        const notes = getChordNotes('A', 'minor7', 4);
        expect(notes).toEqual(['A4', 'C5', 'E5', 'G5']);
      });
    });

    it('should respect octave parameter', () => {
      const notesOctave3 = getChordNotes('C', 'major', 3);
      const notesOctave5 = getChordNotes('C', 'major', 5);

      expect(notesOctave3).toEqual(['C3', 'E3', 'G3']);
      expect(notesOctave5).toEqual(['C5', 'E5', 'G5']);
    });

    it('should use default octave 4', () => {
      const notes = getChordNotes('C', 'major');
      expect(notes).toEqual(['C4', 'E4', 'G4']);
    });
  });

  describe('buildChordFromNumeral', () => {
    describe('major key chords', () => {
      it('should build I chord in C major', () => {
        const chord = buildChordFromNumeral('C', 'I', 'major');
        expect(chord.root).toBe('C');
        expect(chord.quality).toBe('major');
      });

      it('should build IV chord in C major', () => {
        const chord = buildChordFromNumeral('C', 'IV', 'major');
        expect(chord.root).toBe('F');
        expect(chord.quality).toBe('major');
      });

      it('should build V chord in C major', () => {
        const chord = buildChordFromNumeral('C', 'V', 'major');
        expect(chord.root).toBe('G');
        expect(chord.quality).toBe('major');
      });

      it('should build ii chord in C major', () => {
        const chord = buildChordFromNumeral('C', 'ii', 'major');
        expect(chord.root).toBe('D');
        expect(chord.quality).toBe('minor');
      });

      it('should build vi chord in C major', () => {
        const chord = buildChordFromNumeral('C', 'vi', 'major');
        expect(chord.root).toBe('A');
        expect(chord.quality).toBe('minor');
      });

      it('should build viio chord in C major', () => {
        const chord = buildChordFromNumeral('C', 'viio', 'major');
        expect(chord.root).toBe('B');
        expect(chord.quality).toBe('diminished');
      });
    });

    describe('minor key chords', () => {
      it('should build i chord in A minor', () => {
        const chord = buildChordFromNumeral('A', 'i', 'minor');
        expect(chord.root).toBe('A');
        expect(chord.quality).toBe('minor');
      });

      it('should build iv chord in A minor', () => {
        const chord = buildChordFromNumeral('A', 'iv', 'minor');
        expect(chord.root).toBe('D');
        expect(chord.quality).toBe('minor');
      });

      it('should build V chord in A minor (major V)', () => {
        const chord = buildChordFromNumeral('A', 'V', 'minor');
        expect(chord.root).toBe('E');
        expect(chord.quality).toBe('major');
      });
    });

    describe('transposed keys', () => {
      it('should build I chord in G major', () => {
        const chord = buildChordFromNumeral('G', 'I', 'major');
        expect(chord.root).toBe('G');
        expect(chord.quality).toBe('major');
      });

      it('should build V chord in G major', () => {
        const chord = buildChordFromNumeral('G', 'V', 'major');
        expect(chord.root).toBe('D');
        expect(chord.quality).toBe('major');
      });

      it('should build IV chord in D major', () => {
        const chord = buildChordFromNumeral('D', 'IV', 'major');
        expect(chord.root).toBe('G');
        expect(chord.quality).toBe('major');
      });
    });

    it('should include chord notes', () => {
      const chord = buildChordFromNumeral('C', 'I', 'major', 4);
      expect(chord.notes).toEqual(['C4', 'E4', 'G4']);
    });

    it('should respect octave parameter', () => {
      const chord = buildChordFromNumeral('C', 'I', 'major', 3);
      expect(chord.notes).toEqual(['C3', 'E3', 'G3']);
    });
  });

  describe('buildProgression', () => {
    it('should build I-IV-V-I progression in C major', () => {
      const progression = buildProgression('C', ['I', 'IV', 'V', 'I'], 'major');

      expect(progression).toHaveLength(4);
      expect(progression[0].root).toBe('C');
      expect(progression[1].root).toBe('F');
      expect(progression[2].root).toBe('G');
      expect(progression[3].root).toBe('C');
    });

    it('should build I-V-vi-IV progression in G major', () => {
      const progression = buildProgression('G', ['I', 'V', 'vi', 'IV'], 'major');

      expect(progression).toHaveLength(4);
      expect(progression[0].root).toBe('G');
      expect(progression[0].quality).toBe('major');
      expect(progression[1].root).toBe('D');
      expect(progression[1].quality).toBe('major');
      expect(progression[2].root).toBe('E');
      expect(progression[2].quality).toBe('minor');
      expect(progression[3].root).toBe('C');
      expect(progression[3].quality).toBe('major');
    });

    it('should build ii-V-I progression in C major', () => {
      const progression = buildProgression('C', ['ii', 'V', 'I'], 'major');

      expect(progression).toHaveLength(3);
      expect(progression[0].root).toBe('D');
      expect(progression[0].quality).toBe('minor');
      expect(progression[1].root).toBe('G');
      expect(progression[1].quality).toBe('major');
      expect(progression[2].root).toBe('C');
      expect(progression[2].quality).toBe('major');
    });

    it('should build i-iv-V progression in A minor', () => {
      const progression = buildProgression('A', ['i', 'iv', 'V'], 'minor');

      expect(progression).toHaveLength(3);
      expect(progression[0].root).toBe('A');
      expect(progression[0].quality).toBe('minor');
      expect(progression[1].root).toBe('D');
      expect(progression[1].quality).toBe('minor');
      expect(progression[2].root).toBe('E');
      expect(progression[2].quality).toBe('major');
    });

    it('should include notes for each chord', () => {
      const progression = buildProgression('C', ['I', 'V'], 'major', 4);

      expect(progression[0].notes).toEqual(['C4', 'E4', 'G4']);
      expect(progression[1].notes).toEqual(['G4', 'B4', 'D5']);
    });

    it('should handle empty progression', () => {
      const progression = buildProgression('C', [], 'major');
      expect(progression).toEqual([]);
    });

    it('should handle single chord progression', () => {
      const progression = buildProgression('C', ['I'], 'major');
      expect(progression).toHaveLength(1);
      expect(progression[0].root).toBe('C');
    });
  });

  describe('getRandomKey', () => {
    it('should return a valid note name', () => {
      const key = getRandomKey();
      const validKeys = ['C', 'G', 'D', 'A', 'E', 'F', 'Bb'];
      expect(validKeys).toContain(key);
    });

    it('should return only common keys for ear training', () => {
      const commonKeys = ['C', 'G', 'D', 'A', 'E', 'F', 'Bb'];
      const generatedKeys = new Set<string>();

      for (let i = 0; i < 100; i++) {
        generatedKeys.add(getRandomKey());
      }

      generatedKeys.forEach((key) => {
        expect(commonKeys).toContain(key);
      });
    });

    it('should produce varied results over multiple calls', () => {
      const keys = new Set<string>();

      for (let i = 0; i < 50; i++) {
        keys.add(getRandomKey());
      }

      expect(keys.size).toBeGreaterThan(1);
    });
  });

  describe('integration: full chord progression workflow', () => {
    it('should correctly build a salsa-style progression', () => {
      const progression = buildProgression('C', ['I', 'IV', 'V', 'I'], 'major', 4);

      expect(progression[0]).toEqual({
        root: 'C',
        quality: 'major',
        notes: ['C4', 'E4', 'G4'],
      });
      expect(progression[1]).toEqual({
        root: 'F',
        quality: 'major',
        notes: ['F4', 'A4', 'C5'],
      });
      expect(progression[2]).toEqual({
        root: 'G',
        quality: 'major',
        notes: ['G4', 'B4', 'D5'],
      });
    });

    it('should handle transposition of entire progression', () => {
      const cProgression = buildProgression('C', ['I', 'V'], 'major');
      const gProgression = buildProgression('G', ['I', 'V'], 'major');

      expect(cProgression[0].root).toBe('C');
      expect(cProgression[1].root).toBe('G');
      expect(gProgression[0].root).toBe('G');
      expect(gProgression[1].root).toBe('D');
    });
  });
});
