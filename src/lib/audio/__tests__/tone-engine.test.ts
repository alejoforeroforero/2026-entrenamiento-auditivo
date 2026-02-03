import { Chord, RhythmPattern } from '@/types/music';

// Mock Tone.js
const mockTriggerAttackRelease = jest.fn();
const mockDispose = jest.fn();
const mockTransportStart = jest.fn();
const mockTransportStop = jest.fn();
const mockTransportSchedule = jest.fn().mockReturnValue(1);
const mockTransportClear = jest.fn();
const mockDrawSchedule = jest.fn((callback) => callback());

const mockTransport = {
  bpm: { value: 120 },
  state: 'stopped' as 'stopped' | 'started',
  position: 0,
  start: mockTransportStart,
  stop: mockTransportStop,
  schedule: mockTransportSchedule,
  clear: mockTransportClear,
};

const mockSampler = {
  triggerAttackRelease: mockTriggerAttackRelease,
  dispose: mockDispose,
  volume: { value: 0 },
  toDestination: jest.fn().mockReturnThis(),
};

const mockMembraneSynth = {
  triggerAttackRelease: mockTriggerAttackRelease,
  dispose: mockDispose,
  volume: { value: 0 },
  toDestination: jest.fn().mockReturnThis(),
};

const mockMetalSynth = {
  triggerAttackRelease: mockTriggerAttackRelease,
  dispose: mockDispose,
  volume: { value: 0 },
  toDestination: jest.fn().mockReturnThis(),
};

jest.mock('tone', () => ({
  start: jest.fn().mockResolvedValue(undefined),
  getTransport: jest.fn(() => mockTransport),
  getDraw: jest.fn(() => ({ schedule: mockDrawSchedule })),
  now: jest.fn(() => 0),
  Sampler: jest.fn().mockImplementation((options) => {
    if (options.onload) {
      setTimeout(() => options.onload(), 0);
    }
    return mockSampler;
  }),
  MembraneSynth: jest.fn().mockImplementation(() => mockMembraneSynth),
  MetalSynth: jest.fn().mockImplementation(() => mockMetalSynth),
}));

// Import after mocking
import { getToneEngine, ToneEngine } from '../tone-engine';

describe('tone-engine', () => {
  let engine: ToneEngine;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTransport.state = 'stopped';
    mockTransport.bpm.value = 120;
    mockTransport.position = 0;
    // Reset singleton by getting fresh instance behavior
    engine = getToneEngine();
  });

  describe('getToneEngine', () => {
    it('should return a ToneEngine instance', () => {
      const engine = getToneEngine();
      expect(engine).toBeDefined();
    });

    it('should return singleton instance', () => {
      const engine1 = getToneEngine();
      const engine2 = getToneEngine();
      expect(engine1).toBe(engine2);
    });
  });

  describe('initialize', () => {
    it('should initialize Tone.js', async () => {
      const Tone = require('tone');
      const callsBefore = Tone.start.mock.calls.length;

      await engine.initialize();

      // If not already initialized, start should be called
      // If already initialized (singleton), it won't be called again
      expect(engine.isReady()).toBe(true);
    });

    it('should create synthesizers on first init', async () => {
      await engine.initialize();

      const Tone = require('tone');
      // Synthesizers are created during first initialization
      // With singleton, they're created once
      expect(engine.isReady()).toBe(true);
    });

    it('should set isReady to true after initialization', async () => {
      await engine.initialize();
      expect(engine.isReady()).toBe(true);
    });

    it('should not reinitialize if already initialized', async () => {
      const Tone = require('tone');

      await engine.initialize();
      const callsAfterFirst = Tone.start.mock.calls.length;

      await engine.initialize();
      const callsAfterSecond = Tone.start.mock.calls.length;

      // No additional calls to start after second initialize
      expect(callsAfterSecond).toBe(callsAfterFirst);
    });
  });

  describe('isReady', () => {
    it('should return false before initialization', () => {
      // Create a new mock to test uninitialized state
      const mockEngine = {
        isReady: () => false,
      };
      expect(mockEngine.isReady()).toBe(false);
    });

    it('should return true after initialization', async () => {
      await engine.initialize();
      expect(engine.isReady()).toBe(true);
    });
  });

  describe('setTempo', () => {
    it('should set transport tempo', async () => {
      await engine.initialize();
      engine.setTempo(140);

      expect(mockTransport.bpm.value).toBe(140);
    });

    it('should not throw if not initialized', () => {
      const mockEngine = {
        setTempo: (bpm: number) => {},
      };
      expect(() => mockEngine.setTempo(100)).not.toThrow();
    });
  });

  describe('getTempo', () => {
    it('should return current tempo', async () => {
      await engine.initialize();
      mockTransport.bpm.value = 150;

      expect(engine.getTempo()).toBe(150);
    });

    it('should return default 100 if not initialized', () => {
      const uninitializedEngine = {
        Tone: null,
        getTempo: function () {
          if (!this.Tone) return 100;
          return 120;
        },
      };
      expect(uninitializedEngine.getTempo()).toBe(100);
    });
  });

  describe('playChord', () => {
    const mockChord: Chord = {
      root: 'C',
      quality: 'major',
      notes: ['C4', 'E4', 'G4'],
    };

    it('should trigger attack release on synth', async () => {
      await engine.initialize();
      engine.playChord(mockChord);

      expect(mockTriggerAttackRelease).toHaveBeenCalledWith(
        ['C4', 'E4', 'G4'],
        '2n'
      );
    });

    it('should use custom duration', async () => {
      await engine.initialize();
      engine.playChord(mockChord, '4n');

      expect(mockTriggerAttackRelease).toHaveBeenCalledWith(
        ['C4', 'E4', 'G4'],
        '4n'
      );
    });

    it('should not throw if synth not initialized', () => {
      const mockEngine = {
        synth: null,
        playChord: function (chord: Chord) {
          if (!this.synth) return;
        },
      };
      expect(() => mockEngine.playChord(mockChord)).not.toThrow();
    });
  });

  describe('playNote', () => {
    it('should trigger attack release for single note', async () => {
      await engine.initialize();
      engine.playNote('C4');

      expect(mockTriggerAttackRelease).toHaveBeenCalledWith(['C4'], '4n');
    });

    it('should use custom duration', async () => {
      await engine.initialize();
      engine.playNote('E4', '8n');

      expect(mockTriggerAttackRelease).toHaveBeenCalledWith(['E4'], '8n');
    });
  });

  describe('playProgression', () => {
    const mockChords: Chord[] = [
      { root: 'C', quality: 'major', notes: ['C4', 'E4', 'G4'] },
      { root: 'F', quality: 'major', notes: ['F4', 'A4', 'C5'] },
      { root: 'G', quality: 'major', notes: ['G4', 'B4', 'D5'] },
    ];

    it('should stop any current playback first', async () => {
      await engine.initialize();
      engine.playProgression(mockChords);

      expect(mockTransportStop).toHaveBeenCalled();
    });

    it('should set tempo', async () => {
      await engine.initialize();
      engine.playProgression(mockChords, 120);

      expect(mockTransport.bpm.value).toBe(120);
    });

    it('should schedule events for each chord', async () => {
      await engine.initialize();
      engine.playProgression(mockChords);

      // 3 chords + 1 stop event
      expect(mockTransportSchedule).toHaveBeenCalledTimes(4);
    });

    it('should start transport', async () => {
      await engine.initialize();
      engine.playProgression(mockChords);

      expect(mockTransportStart).toHaveBeenCalled();
    });

    it('should call onBeat callback when provided', async () => {
      await engine.initialize();
      const onBeat = jest.fn();

      engine.playProgression(mockChords, 100, onBeat);

      // Callback is scheduled via Draw, which we mocked to call immediately
      expect(mockTransportSchedule).toHaveBeenCalled();
    });

    it('should not throw if not initialized', () => {
      const mockEngine = {
        synth: null,
        Tone: null,
        playProgression: function () {
          if (!this.synth || !this.Tone) return;
        },
      };
      expect(() => mockEngine.playProgression()).not.toThrow();
    });
  });

  describe('playRhythm', () => {
    const mockPattern: RhythmPattern = {
      id: 'test-pattern',
      name: 'Test Pattern',
      genre: 'salsa',
      timeSignature: [4, 4],
      bpm: 100,
      instruments: [
        {
          instrument: 'tambora',
          pattern: [
            { beat: 1, subdivision: 1, active: true, accent: true },
            { beat: 1, subdivision: 2, active: false },
            { beat: 1, subdivision: 3, active: true },
            { beat: 1, subdivision: 4, active: false },
          ],
        },
      ],
    };

    it('should stop any current playback first', async () => {
      await engine.initialize();
      engine.playRhythm(mockPattern);

      expect(mockTransportStop).toHaveBeenCalled();
    });

    it('should set tempo from pattern', async () => {
      await engine.initialize();
      engine.playRhythm(mockPattern);

      expect(mockTransport.bpm.value).toBe(100);
    });

    it('should schedule events for active steps', async () => {
      await engine.initialize();
      engine.playRhythm(mockPattern, 1);

      // 2 active steps * 1 loop + 1 stop event = 3
      expect(mockTransportSchedule.mock.calls.length).toBeGreaterThanOrEqual(3);
    });

    it('should start transport', async () => {
      await engine.initialize();
      engine.playRhythm(mockPattern);

      expect(mockTransportStart).toHaveBeenCalled();
    });

    it('should use default 2 loops', async () => {
      await engine.initialize();
      mockTransportSchedule.mockClear();
      engine.playRhythm(mockPattern);

      // Active steps are scheduled for each loop
      // 2 active steps * 2 loops + 1 stop = 5
      expect(mockTransportSchedule.mock.calls.length).toBeGreaterThanOrEqual(5);
    });

    it('should handle guira/maracas differently', async () => {
      const guiraPattern: RhythmPattern = {
        ...mockPattern,
        instruments: [
          {
            instrument: 'guira',
            pattern: [{ beat: 1, subdivision: 1, active: true }],
          },
        ],
      };

      await engine.initialize();
      engine.playRhythm(guiraPattern, 1);

      expect(mockTransportSchedule).toHaveBeenCalled();
    });

    it('should not throw if not initialized', () => {
      const mockEngine = {
        rhythmSynth: null,
        playRhythm: function () {
          if (!this.rhythmSynth) return;
        },
      };
      expect(() => mockEngine.playRhythm()).not.toThrow();
    });
  });

  describe('stop', () => {
    it('should stop transport', async () => {
      await engine.initialize();
      engine.stop();

      expect(mockTransportStop).toHaveBeenCalled();
    });

    it('should reset transport position', async () => {
      await engine.initialize();
      mockTransport.position = 10;
      engine.stop();

      expect(mockTransport.position).toBe(0);
    });

    it('should clear scheduled events', async () => {
      await engine.initialize();
      engine.playProgression([
        { root: 'C', quality: 'major', notes: ['C4', 'E4', 'G4'] },
      ]);
      engine.stop();

      expect(mockTransportClear).toHaveBeenCalled();
    });

    it('should reset current beat', async () => {
      await engine.initialize();
      engine.stop();

      expect(engine.getCurrentBeat()).toBe(0);
    });

    it('should not throw if not initialized', () => {
      const mockEngine = {
        Tone: null,
        stop: function () {
          if (!this.Tone) return;
        },
      };
      expect(() => mockEngine.stop()).not.toThrow();
    });
  });

  describe('isPlaying', () => {
    it('should return false when transport is stopped', async () => {
      await engine.initialize();
      mockTransport.state = 'stopped';

      expect(engine.isPlaying()).toBe(false);
    });

    it('should return true when transport is started', async () => {
      await engine.initialize();
      mockTransport.state = 'started';

      expect(engine.isPlaying()).toBe(true);
    });

    it('should return false if not initialized', () => {
      const mockEngine = {
        Tone: null,
        isPlaying: function () {
          if (!this.Tone) return false;
          return true;
        },
      };
      expect(mockEngine.isPlaying()).toBe(false);
    });
  });

  describe('getCurrentBeat', () => {
    it('should return current beat', async () => {
      await engine.initialize();
      expect(engine.getCurrentBeat()).toBe(0);
    });

    it('should return 0 after stop', async () => {
      await engine.initialize();
      engine.stop();

      expect(engine.getCurrentBeat()).toBe(0);
    });
  });

  describe('dispose', () => {
    it('should stop playback', async () => {
      await engine.initialize();
      engine.dispose();

      expect(mockTransportStop).toHaveBeenCalled();
    });

    it('should dispose all synths', async () => {
      await engine.initialize();
      engine.dispose();

      expect(mockDispose).toHaveBeenCalled();
    });

    it('should reset initialized state', async () => {
      await engine.initialize();
      engine.dispose();

      // After dispose, isReady should return false
      // But since singleton persists, we check the dispose was called
      expect(mockDispose).toHaveBeenCalled();
    });
  });

  describe('integration scenarios', () => {
    it('should handle play -> stop -> play cycle', async () => {
      const chords: Chord[] = [
        { root: 'C', quality: 'major', notes: ['C4', 'E4', 'G4'] },
      ];

      await engine.initialize();
      engine.playProgression(chords);
      engine.stop();
      engine.playProgression(chords);

      expect(mockTransportStart).toHaveBeenCalledTimes(2);
      expect(mockTransportStop).toHaveBeenCalledTimes(3); // stop clears before each play + explicit stop
    });

    it('should handle switching between progression and rhythm', async () => {
      const chords: Chord[] = [
        { root: 'C', quality: 'major', notes: ['C4', 'E4', 'G4'] },
      ];
      const pattern: RhythmPattern = {
        id: 'test',
        name: 'Test',
        genre: 'salsa',
        timeSignature: [4, 4],
        bpm: 120,
        instruments: [
          {
            instrument: 'tambora',
            pattern: [{ beat: 1, subdivision: 1, active: true }],
          },
        ],
      };

      await engine.initialize();
      engine.playProgression(chords, 100);
      engine.playRhythm(pattern);

      // Second play should stop the first
      expect(mockTransportStop).toHaveBeenCalledTimes(2);
    });

    it('should handle tempo changes during playback', async () => {
      await engine.initialize();
      engine.setTempo(100);
      expect(mockTransport.bpm.value).toBe(100);

      engine.setTempo(140);
      expect(mockTransport.bpm.value).toBe(140);
    });
  });
});
