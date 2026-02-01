'use client';

import { useState, useCallback, useMemo } from 'react';
import { Play, Square, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SongPlayerCard } from '@/components/songs/song-player-card';
import { useTone } from '@/hooks/useTone';
import { buildProgression, getRandomKey } from '@/lib/music';
import { RomanNumeral } from '@/types/music';

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
    const mode = progression.numerals[0] === 'i' || progression.numerals[0] === 'iv' ? 'minor' : 'major';
    const chords = buildProgression(key, progression.numerals as RomanNumeral[], mode);
    playProgression(chords, 60);
  }, [progression, isReady, initialize, isPlaying, stop, playProgression]);

  return (
    <div className="max-w-2xl space-y-6 md:space-y-10">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {progression.name}
        </h1>
        {progression.description && (
          <p className="text-muted-foreground mt-1.5 md:mt-2 text-base md:text-lg">
            {progression.description}
          </p>
        )}
      </div>

      <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-card/50 border border-border/50">
        <div className="flex items-center justify-center">
          <Button
            size="default"
            className="gap-2 h-10 px-5 rounded-lg text-sm glow hover:glow transition-all duration-300"
            onClick={handlePlay}
          >
            {isPlaying ? (
              <>
                <Square className="w-4 h-4" />
                Detener
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Escuchar progresión
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar canciones..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 md:pl-11 h-10 md:h-12 rounded-xl bg-card/50 border-border/50 focus:border-primary/50"
        />
      </div>

      <div className="space-y-4 md:space-y-5">
        <h2 className="text-sm font-medium text-muted-foreground">
          {filteredSongs.length} {filteredSongs.length === 1 ? 'canción' : 'canciones'}
        </h2>

        {filteredSongs.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <p className="text-muted-foreground">
              {searchQuery ? 'No se encontraron canciones' : 'No hay canciones con esta progresión en este género'}
            </p>
          </div>
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
