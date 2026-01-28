import { Song, Genre } from '@/types/music';

// Songs are now managed via admin panel and stored in localStorage
export const songs: Song[] = [];

export const getSongsByGenre = (genre: Genre): Song[] => {
  return songs.filter((s) => s.genre === genre);
};

export const getSongById = (id: string): Song | undefined => {
  return songs.find((s) => s.id === id);
};

export const getSongsByProgression = (progression: string[]): Song[] => {
  const progStr = progression.join('-');
  return songs.filter((s) => s.progression.join('-') === progStr);
};

export const getRandomSong = (genre?: Genre): Song => {
  const filtered = genre ? getSongsByGenre(genre) : songs;
  return filtered[Math.floor(Math.random() * filtered.length)];
};
