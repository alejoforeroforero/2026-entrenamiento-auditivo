'use client';

import Link from 'next/link';
import { Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@heroui/react';
import { SongPlayerCard } from '@/components/songs/song-player-card';

interface FavoriteSong {
  id: string;
  title: string;
  artist: string;
  key: string;
  mode: 'major' | 'minor';
  youtubeId: string | null;
  startTime: number | null;
  duration: number | null;
  progression: { id: string; name: string } | null;
  genre: { id: string } | null;
}

interface FavoritosClientProps {
  favorites: FavoriteSong[];
}

export function FavoritosClient({ favorites }: FavoritosClientProps) {
  return (
    <div className="container max-w-2xl py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="light" isIconOnly as={Link} href="/perfil">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500" />
            Mis Favoritos
          </h1>
          <p className="text-muted-foreground">
            {favorites.length} {favorites.length === 1 ? 'canción guardada' : 'canciones guardadas'}
          </p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No tienes favoritos</h2>
          <p className="text-muted-foreground mb-6">
            Explora el repertorio y guarda tus canciones favoritas
          </p>
          <Button color="primary" as={Link} href="/">
            Explorar canciones
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {favorites.map((song) => (
            <SongPlayerCard
              key={song.id}
              song={{
                id: song.id,
                title: song.title,
                artist: song.artist,
                key: song.key,
                mode: song.mode,
                youtubeId: song.youtubeId,
                startTime: song.startTime,
                duration: song.duration,
              }}
              isFavorited={true}
              showProgression={true}
              progression={song.progression}
              genre={song.genre}
            />
          ))}
        </div>
      )}
    </div>
  );
}
