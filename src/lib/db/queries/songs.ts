import { prisma } from '../index';

export async function getSongs() {
  return prisma.song.findMany({
    include: {
      genre: true,
      progression: true,
    },
    orderBy: { title: 'asc' },
  });
}

export async function getSongById(id: string) {
  return prisma.song.findUnique({
    where: { id },
    include: {
      genre: true,
      progression: true,
    },
  });
}

export async function getSongsByGenre(genreId: string) {
  return prisma.song.findMany({
    where: { genreId },
    include: {
      progression: true,
    },
    orderBy: { title: 'asc' },
  });
}

export async function getSongsByProgression(progressionId: string) {
  return prisma.song.findMany({
    where: { progressionId },
    include: {
      genre: true,
    },
    orderBy: { title: 'asc' },
  });
}

export async function getRandomSongByGenre(genreId: string) {
  const songs = await prisma.song.findMany({
    where: { genreId },
    include: {
      progression: true,
    },
  });

  if (songs.length === 0) return null;
  return songs[Math.floor(Math.random() * songs.length)];
}

export async function getRandomSong() {
  const songs = await prisma.song.findMany({
    include: {
      genre: true,
      progression: true,
    },
  });

  if (songs.length === 0) return null;
  return songs[Math.floor(Math.random() * songs.length)];
}
