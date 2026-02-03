import { prisma } from '@/lib/db';

export async function getSongsByGenre(genreId: string) {
  return prisma.song.findMany({
    where: { genreId },
    include: { progression: true },
    orderBy: { title: 'asc' },
  });
}

export async function getProgressionsForGenre(genreId: string) {
  return prisma.progression.findMany({
    where: {
      songs: {
        some: { genreId },
      },
    },
    select: {
      id: true,
      name: true,
      difficulty: true,
      _count: {
        select: { songs: true },
      },
    },
    orderBy: [{ difficulty: 'asc' }, { name: 'asc' }],
  });
}

export async function getSongsForProgressionInGenre(progressionId: string, genreId: string) {
  return prisma.song.findMany({
    where: {
      progressionId,
      genreId,
    },
    include: { progression: true },
    orderBy: { title: 'asc' },
  });
}

export async function isValidGenre(genreId: string) {
  const genre = await prisma.genre.findUnique({
    where: { id: genreId },
  });
  return genre !== null;
}

export async function getRandomSongByGenre(genreId: string) {
  const songs = await prisma.song.findMany({
    where: { genreId },
    include: { progression: true },
  });

  if (songs.length === 0) return null;
  return songs[Math.floor(Math.random() * songs.length)];
}

export async function getRandomProgressionForGenre(genreId: string) {
  const progressions = await getProgressionsForGenre(genreId);
  if (progressions.length === 0) return null;
  return progressions[Math.floor(Math.random() * progressions.length)];
}

export async function getGenreStats(genreId: string) {
  const [progressions, songs] = await Promise.all([
    prisma.progression.count({
      where: {
        songs: {
          some: { genreId },
        },
      },
    }),
    prisma.song.count({
      where: { genreId },
    }),
  ]);

  return { progressions, songs };
}

const MIN_SONGS_FOR_ACTIVE_GENRE = 5;

export async function hasContentForGenre(genreId: string) {
  const count = await prisma.song.count({
    where: { genreId },
  });
  return count >= MIN_SONGS_FOR_ACTIVE_GENRE;
}
