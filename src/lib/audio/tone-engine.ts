'use client';

import { Chord, Note, RhythmPattern } from '@/types/music';

type AudioCallback = (beat: number) => void;

type ToneModule = typeof import('tone');

class ToneEngine {
  private Tone: ToneModule | null = null;
  private synth: InstanceType<ToneModule['Sampler']> | null = null;
  private rhythmSynth: InstanceType<ToneModule['MembraneSynth']> | null = null;
  private hiHatSynth: InstanceType<ToneModule['MetalSynth']> | null = null;
  private isInitialized = false;
  private onBeatCallback: AudioCallback | null = null;
  private currentBeat = 0;
  private scheduledEvents: number[] = [];

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Dynamically import Tone.js only when needed
    this.Tone = await import('tone');
    await this.Tone.start();

    // Piano sampler using Salamander Grand Piano samples
    await new Promise<void>((resolve) => {
      this.synth = new this.Tone!.Sampler({
        urls: {
          A1: 'A1.mp3',
          A2: 'A2.mp3',
          A3: 'A3.mp3',
          A4: 'A4.mp3',
          A5: 'A5.mp3',
          C2: 'C2.mp3',
          C3: 'C3.mp3',
          C4: 'C4.mp3',
          C5: 'C5.mp3',
          'D#2': 'Ds2.mp3',
          'D#3': 'Ds3.mp3',
          'D#4': 'Ds4.mp3',
          'F#2': 'Fs2.mp3',
          'F#3': 'Fs3.mp3',
          'F#4': 'Fs4.mp3',
        },
        baseUrl: 'https://tonejs.github.io/audio/salamander/',
        release: 1,
        onload: () => resolve(),
      }).toDestination();
      this.synth.volume.value = -6;
    });

    // Membrane synth for drum sounds
    this.rhythmSynth = new this.Tone!.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: {
        type: 'sine',
      },
      envelope: {
        attack: 0.001,
        decay: 0.4,
        sustain: 0.01,
        release: 1.4,
      },
    }).toDestination();
    this.rhythmSynth.volume.value = -3;

    // Metal synth for hi-hat/guira sounds
    this.hiHatSynth = new this.Tone!.MetalSynth({
      envelope: {
        attack: 0.001,
        decay: 0.1,
        release: 0.01,
      },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    }).toDestination();
    this.hiHatSynth.volume.value = -12;

    this.isInitialized = true;
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  setTempo(bpm: number): void {
    if (!this.Tone) return;
    this.Tone.getTransport().bpm.value = bpm;
  }

  getTempo(): number {
    if (!this.Tone) return 100;
    return this.Tone.getTransport().bpm.value;
  }

  // Play a single chord
  playChord(chord: Chord, duration: string = '2n'): void {
    if (!this.synth) return;
    this.synth.triggerAttackRelease(chord.notes, duration);
  }

  // Play a single note
  playNote(note: Note, duration: string = '4n'): void {
    if (!this.synth) return;
    this.synth.triggerAttackRelease([note], duration);
  }

  // Play a chord progression
  playProgression(
    chords: Chord[],
    tempo: number = 100,
    onBeat?: AudioCallback
  ): void {
    if (!this.synth || !this.Tone) return;

    this.stop();
    this.setTempo(tempo);
    this.onBeatCallback = onBeat || null;
    this.currentBeat = 0;

    const transport = this.Tone.getTransport();
    const Tone = this.Tone;

    chords.forEach((chord, index) => {
      const eventId = transport.schedule((time) => {
        this.synth!.triggerAttackRelease(chord.notes, 0.9, time);
        this.currentBeat = index;
        if (this.onBeatCallback) {
          Tone.getDraw().schedule(() => {
            this.onBeatCallback!(index);
          }, time);
        }
      }, index); // Schedule at index seconds (0, 1, 2, 3...)
      this.scheduledEvents.push(eventId);
    });

    // Schedule stop after progression
    const stopId = transport.schedule(() => {
      this.stop();
      if (this.onBeatCallback) {
        Tone.getDraw().schedule(() => {
          this.onBeatCallback!(-1);
        }, Tone.now());
      }
    }, chords.length + 0.5); // Stop half second after last chord
    this.scheduledEvents.push(stopId);

    transport.start();
  }

  // Play a rhythm pattern
  playRhythm(
    pattern: RhythmPattern,
    loops: number = 2,
    onBeat?: AudioCallback
  ): void {
    if (!this.rhythmSynth || !this.hiHatSynth || !this.Tone) return;

    this.stop();
    this.setTempo(pattern.bpm);
    this.onBeatCallback = onBeat || null;
    this.currentBeat = 0;

    const transport = this.Tone.getTransport();
    const Tone = this.Tone;
    const [beats] = pattern.timeSignature;
    const stepsPerBeat = 4;

    for (let loop = 0; loop < loops; loop++) {
      pattern.instruments.forEach(({ instrument, pattern: steps }) => {
        steps.forEach((step, stepIndex) => {
          if (step.active) {
            const time = `${loop}:${Math.floor(stepIndex / stepsPerBeat)}:${(stepIndex % stepsPerBeat) * (4 / stepsPerBeat)}`;

            const eventId = transport.schedule((t) => {
              if (instrument === 'guira' || instrument === 'maracas') {
                this.hiHatSynth!.triggerAttackRelease(
                  step.accent ? '32n' : '64n',
                  t
                );
              } else {
                const pitch = step.accent ? 'C2' : 'C1';
                this.rhythmSynth!.triggerAttackRelease(pitch, '8n', t);
              }

              // Call beat callback on main beats
              if (stepIndex % stepsPerBeat === 0 && instrument === pattern.instruments[0].instrument) {
                const beat = loop * beats + Math.floor(stepIndex / stepsPerBeat);
                this.currentBeat = beat;
                if (this.onBeatCallback) {
                  Tone.getDraw().schedule(() => {
                    this.onBeatCallback!(stepIndex);
                  }, t);
                }
              }
            }, time);
            this.scheduledEvents.push(eventId);
          }
        });
      });
    }

    // Schedule stop
    const stopId = transport.schedule(() => {
      this.stop();
      if (this.onBeatCallback) {
        Tone.getDraw().schedule(() => {
          this.onBeatCallback!(-1);
        }, Tone.now());
      }
    }, `${loops}:0:0`);
    this.scheduledEvents.push(stopId);

    transport.start();
  }

  // Stop playback
  stop(): void {
    if (!this.Tone) return;
    const transport = this.Tone.getTransport();
    transport.stop();
    transport.position = 0;

    // Clear scheduled events
    this.scheduledEvents.forEach((id) => {
      transport.clear(id);
    });
    this.scheduledEvents = [];
    this.currentBeat = 0;
  }

  // Check if playing
  isPlaying(): boolean {
    if (!this.Tone) return false;
    return this.Tone.getTransport().state === 'started';
  }

  getCurrentBeat(): number {
    return this.currentBeat;
  }

  // Cleanup
  dispose(): void {
    this.stop();
    this.synth?.dispose();
    this.rhythmSynth?.dispose();
    this.hiHatSynth?.dispose();
    this.synth = null;
    this.rhythmSynth = null;
    this.hiHatSynth = null;
    this.isInitialized = false;
  }
}

// Singleton instance
let engineInstance: ToneEngine | null = null;

export function getToneEngine(): ToneEngine {
  if (!engineInstance) {
    engineInstance = new ToneEngine();
  }
  return engineInstance;
}

export type { ToneEngine };
