'use client';

import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button, Slider } from '@heroui/react';

interface AudioPlayerProps {
  isPlaying: boolean;
  isReady: boolean;
  tempo: number;
  onPlay: () => void;
  onStop: () => void;
  onTempoChange: (tempo: number) => void;
  onRepeat?: () => void;
  showRepeat?: boolean;
}

export function AudioPlayer({
  isPlaying,
  isReady,
  tempo,
  onPlay,
  onStop,
  onTempoChange,
  onRepeat,
  showRepeat = true,
}: AudioPlayerProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-2">
        <Button
          variant={isPlaying ? 'flat' : 'solid'}
          color="primary"
          isIconOnly
          onPress={isPlaying ? onStop : onPlay}
          isDisabled={!isReady}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        {showRepeat && onRepeat && (
          <Button
            variant="bordered"
            isIconOnly
            onPress={onRepeat}
            isDisabled={!isReady || isPlaying}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 flex items-center gap-4">
        <span className="text-sm text-muted-foreground w-16">
          {tempo} BPM
        </span>
        <Slider
          value={tempo}
          onChange={(value) => onTempoChange(value as number)}
          minValue={60}
          maxValue={180}
          step={5}
          className="w-32"
          isDisabled={isPlaying}
          size="sm"
        />
      </div>

      {!isReady && (
        <span className="text-sm text-muted-foreground">
          Click para activar audio
        </span>
      )}
    </div>
  );
}
