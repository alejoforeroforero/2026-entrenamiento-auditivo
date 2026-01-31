import { Song } from '@/types/music';

export const songs: Song[] = [];

export const getSongsByGenre = (genreId: string): Song[] => {
  return songs.filter((s) => s.genreId === genreId);
};

export const getSongById = (id: string): Song | undefined => {
  return songs.find((s) => s.id === id);
};

export const getSongsByProgression = (progressionId: string): Song[] => {
  return songs.filter((s) => s.progressionId === progressionId);
};

export const getRandomSong = (genreId?: string): Song => {
  const filtered = genreId ? getSongsByGenre(genreId) : songs;
  return filtered[Math.floor(Math.random() * filtered.length)];
};
