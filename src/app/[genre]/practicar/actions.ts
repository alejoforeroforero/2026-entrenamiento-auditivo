'use server';

import { prisma } from '@/lib/db';

export async function getRandomSongAction(genreId: string) {
  const songs = await prisma.song.findMany({
    where: { genreId },
    include: { progression: true },
  });

  if (songs.length === 0) return null;
  return songs[Math.floor(Math.random() * songs.length)];
}

export async function getRandomProgressionAction(genreId: string) {
  const progressions = await prisma.progression.findMany({
    where: {
      songs: {
        some: { genreId },
      },
    },
  });

  if (progressions.length === 0) return null;
  return progressions[Math.floor(Math.random() * progressions.length)];
}

export async function getProgressionByIdAction(id: string) {
  return prisma.progression.findUnique({
    where: { id },
  });
}
