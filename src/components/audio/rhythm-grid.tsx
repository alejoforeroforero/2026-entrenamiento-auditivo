'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { RhythmPattern, RhythmInstrument } from '@/types/music';

interface RhythmGridProps {
  pattern: RhythmPattern;
  currentStep: number;
  isPlaying: boolean;
}

const INSTRUMENT_LABELS: Record<RhythmInstrument, string> = {
  guira: 'Güira',
  tambora: 'Tambora',
  caja: 'Caja',
  llamador: 'Llamador',
  alegre: 'Alegre',
  maracas: 'Maracas',
};

const INSTRUMENT_COLORS: Record<RhythmInstrument, string> = {
  guira: 'bg-amber-500',
  tambora: 'bg-red-500',
  caja: 'bg-blue-500',
  llamador: 'bg-green-500',
  alegre: 'bg-purple-500',
  maracas: 'bg-orange-500',
};

export function RhythmGrid({ pattern, currentStep, isPlaying }: RhythmGridProps) {
  const [beats] = pattern.timeSignature;
  const stepsPerBeat = 4;
  const totalSteps = beats * stepsPerBeat;

  return (
    <div className="space-y-4">
      {/* Pattern name and time signature */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{pattern.name}</h3>
        <span className="text-sm text-muted-foreground">
          {pattern.timeSignature[0]}/{pattern.timeSignature[1]} • {pattern.bpm} BPM
        </span>
      </div>

      {/* Grid */}
      <div className="space-y-2">
        {pattern.instruments.map(({ instrument, pattern: steps }) => (
          <div key={instrument} className="flex items-center gap-2">
            {/* Instrument label */}
            <div className="w-20 text-sm font-medium text-right">
              {INSTRUMENT_LABELS[instrument]}
            </div>

            {/* Steps */}
            <div className="flex gap-1">
              {steps.slice(0, totalSteps).map((step, index) => {
                const isBeatStart = index % stepsPerBeat === 0;
                const isCurrentStep = isPlaying && index === currentStep % totalSteps;

                return (
                  <motion.div
                    key={index}
                    className={cn(
                      'w-6 h-6 rounded-sm border',
                      isBeatStart ? 'border-foreground/30' : 'border-foreground/10',
                      step.active
                        ? cn(
                            INSTRUMENT_COLORS[instrument],
                            step.accent && 'ring-2 ring-white'
                          )
                        : 'bg-muted',
                      isCurrentStep && 'ring-2 ring-primary ring-offset-1'
                    )}
                    animate={{
                      scale: isCurrentStep && step.active ? 1.2 : 1,
                      opacity: isCurrentStep ? 1 : step.active ? 0.9 : 0.4,
                    }}
                    transition={{ duration: 0.1 }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Beat markers */}
      <div className="flex items-center gap-2 ml-22">
        <div className="w-20" />
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isBeatStart = index % stepsPerBeat === 0;
            const beatNumber = Math.floor(index / stepsPerBeat) + 1;

            return (
              <div key={index} className="w-6 text-center">
                {isBeatStart && (
                  <span className="text-xs text-muted-foreground">{beatNumber}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
