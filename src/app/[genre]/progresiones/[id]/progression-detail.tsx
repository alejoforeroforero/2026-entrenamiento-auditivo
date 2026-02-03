'use client';

import { useState, useCallback, useMemo } from 'react';
import { Play, Square, Search, Shuffle, Music2 } from 'lucide-react';
import { Button, Input, Card, CardBody, Chip } from '@heroui/react';
import { SongPlayerCard } from '@/components/songs/song-player-card';
import { useTone } from '@/hooks/useTone';
import { buildProgression, getRandomKey } from '@/lib/music';
import { RomanNumeral, NoteName } from '@/types/music';

interface Song {
  id: string;
  title: string;
  artist: string;
  key: string;
  mode: 'major' | 'minor';
  youtubeId: string | null;
  startTime: number | null;
  duration: number | null;
}

interface Progression {
  id: string;
  name: string;
  numerals: string[];
  description: string | null;
}

interface ProgressionDetailProps {
  genre: string;
  progression: Progression;
  songs: Song[];
  favoriteIds?: string[];
}

export function ProgressionDetail({ genre, progression, songs, favoriteIds = [] }: ProgressionDetailProps) {
  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentKey, setCurrentKey] = useState<NoteName | null>(null);
  const { initialize, isReady, playProgression, stop, isPlaying } = useTone();

  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return songs;
    const query = searchQuery.toLowerCase();
    return songs.filter(
      (song) =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
    );
  }, [songs, searchQuery]);

  const handlePlay = useCallback(async () => {
    if (!isReady) {
      await initialize();
    }

    if (isPlaying) {
      stop();
      return;
    }

    const key = getRandomKey();
    setCurrentKey(key);
    const mode = progression.numerals[0] === 'i' || progression.numerals[0] === 'iv' ? 'minor' : 'major';
    const chords = buildProgression(key, progression.numerals as RomanNumeral[], mode);
    playProgression(chords, 60);
  }, [progression, isReady, initialize, isPlaying, stop, playProgression]);

  return (
    <div className="max-w-2xl space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {progression.name}
        </h1>
        {progression.description && (
          <p className="text-default-500 mt-1.5 md:mt-2 text-base md:text-lg">
            {progression.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
        <Button
          isIconOnly
          color="primary"
          variant={isPlaying ? 'flat' : 'solid'}
          radius="full"
          size="lg"
          onPress={handlePlay}
          className={!isPlaying ? 'shadow-lg shadow-primary/30' : ''}
        >
          {isPlaying ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {progression.numerals.map((numeral, index) => (
              <span key={index} className="flex items-center gap-1">
                <Chip
                  size="sm"
                  variant={isPlaying ? 'solid' : 'flat'}
                  color={isPlaying ? 'primary' : 'default'}
                  classNames={{
                    base: isPlaying ? 'animate-pulse' : '',
                  }}
                >
                  {numeral}
                </Chip>
                {index < progression.numerals.length - 1 && (
                  <span className="text-default-400 text-xs">→</span>
                )}
              </span>
            ))}
          </div>
          {currentKey && (
            <p className="text-xs text-default-500 mt-1">
              Tonalidad: {currentKey}
            </p>
          )}
        </div>

        <Button
          isIconOnly
          variant="light"
          size="sm"
          onPress={handlePlay}
          className="text-default-500"
          isDisabled={isPlaying}
        >
          <Shuffle className="w-4 h-4" />
        </Button>
      </div>

      <Input
        placeholder="Buscar canciones..."
        value={searchQuery}
        onValueChange={setSearchQuery}
        startContent={<Search className="h-4 w-4 text-default-400" />}
        variant="bordered"
        radius="lg"
        size="lg"
        classNames={{
          inputWrapper: "bg-content1/50",
        }}
      />

      <div className="space-y-4">
        <p className="text-sm font-medium text-default-500">
          {filteredSongs.length} {filteredSongs.length === 1 ? 'canción' : 'canciones'}
        </p>

        {filteredSongs.length === 0 ? (
          <Card className="bg-content1/30">
            <CardBody className="text-center py-12">
              <p className="text-default-500">
                {searchQuery ? 'No se encontraron canciones' : 'No hay canciones con esta progresión en este género'}
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredSongs.map((song) => (
              <SongPlayerCard
                key={song.id}
                song={song}
                isFavorited={favoriteSet.has(song.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
