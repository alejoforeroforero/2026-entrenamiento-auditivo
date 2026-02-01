import { prisma } from '@/lib/db';

export async function getUserFavorites(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      song: {
        include: {
          genre: true,
          progression: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return favorites.map((f) => f.song);
}

export async function getUserFavoriteIds(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { songId: true },
  });

  return new Set(favorites.map((f) => f.songId));
}

export async function addFavorite(userId: string, songId: string) {
  return prisma.favorite.create({
    data: { userId, songId },
  });
}

export async function removeFavorite(userId: string, songId: string) {
  return prisma.favorite.delete({
    where: {
      userId_songId: { userId, songId },
    },
  });
}

export async function isFavorite(userId: string, songId: string) {
  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_songId: { userId, songId },
    },
  });

  return !!favorite;
}
