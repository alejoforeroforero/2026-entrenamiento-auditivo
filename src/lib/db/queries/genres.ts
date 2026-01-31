import { prisma } from '../index';

export async function getGenres() {
  return prisma.genre.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function getGenreById(id: string) {
  return prisma.genre.findUnique({
    where: { id },
  });
}

export async function getGenreWithStats(id: string) {
  const genre = await prisma.genre.findUnique({
    where: { id },
    include: {
      _count: {
        select: { songs: true },
      },
    },
  });

  if (!genre) return null;

  const progressionCount = await prisma.progression.count({
    where: {
      songs: {
        some: { genreId: id },
      },
    },
  });

  return {
    ...genre,
    songCount: genre._count.songs,
    progressionCount,
  };
}
