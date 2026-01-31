import { prisma } from '../index';

export async function getProgressions() {
  return prisma.progression.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function getProgressionById(id: string) {
  return prisma.progression.findUnique({
    where: { id },
  });
}

export async function getProgressionsForGenre(genreId: string) {
  return prisma.progression.findMany({
    where: {
      songs: {
        some: { genreId },
      },
    },
    include: {
      _count: {
        select: { songs: true },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getProgressionWithSongs(id: string) {
  return prisma.progression.findUnique({
    where: { id },
    include: {
      songs: {
        include: {
          genre: true,
        },
        orderBy: { title: 'asc' },
      },
    },
  });
}
