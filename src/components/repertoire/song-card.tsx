'use client';

import { motion } from 'framer-motion';
import { Music, Calendar, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Song } from '@/types/music';

interface SongCardProps {
  song: Song;
  onClick?: () => void;
  className?: string;
}

const GENRE_COLORS: Record<string, string> = {
  cumbia: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  vallenato: 'bg-green-500/10 text-green-600 border-green-500/20',
  bambuco: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

const DIFFICULTY_LABELS = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

export function SongCard({ song, onClick, className }: SongCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={cn(
          'cursor-pointer hover:border-primary/50 transition-colors',
          className
        )}
        onClick={onClick}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{song.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{song.artist}</p>
            </div>
            <Badge
              variant="outline"
              className={cn('capitalize', GENRE_COLORS[song.genre])}
            >
              {song.genre}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Progression */}
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="text-muted-foreground">Progresión:</span>{' '}
                <span className="font-medium">{song.progression.join('-')}</span>
              </span>
            </div>

            {/* Key */}
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 flex items-center justify-center text-muted-foreground text-xs font-bold">
                ♯
              </span>
              <span className="text-sm">
                <span className="text-muted-foreground">Tonalidad:</span>{' '}
                <span className="font-medium">
                  {song.key} {song.mode === 'minor' ? 'menor' : 'Mayor'}
                </span>
              </span>
            </div>

            {/* Year and difficulty */}
            <div className="flex items-center justify-between">
              {song.year && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{song.year}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((level) => (
                  <Star
                    key={level}
                    className={cn(
                      'w-3 h-3',
                      level <=
                        (song.difficulty === 'beginner'
                          ? 1
                          : song.difficulty === 'intermediate'
                          ? 2
                          : 3)
                        ? 'fill-primary text-primary'
                        : 'text-muted'
                    )}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-1">
                  {DIFFICULTY_LABELS[song.difficulty]}
                </span>
              </div>
            </div>

            {/* Description */}
            {song.description && (
              <p className="text-sm text-muted-foreground pt-2 border-t">
                {song.description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
