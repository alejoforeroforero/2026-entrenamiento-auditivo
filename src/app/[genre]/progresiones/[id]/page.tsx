import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSongsForProgressionInGenre } from '@/lib/data/genre-filters';
import { getUserFavoriteIds } from '@/lib/db/queries/favorites';
import { auth } from '@/lib/auth';
import { ProgressionDetail } from './progression-detail';

async function getProgressionById(id: string) {
  return prisma.progression.findUnique({
    where: { id },
  });
}

export default async function ProgressionPage({
  params,
}: {
  params: Promise<{ genre: string; id: string }>;
}) {
  const { genre, id } = await params;

  const [progression, songs, session] = await Promise.all([
    getProgressionById(id),
    getSongsForProgressionInGenre(id, genre),
    auth(),
  ]);

  if (!progression) {
    notFound();
  }

  const favoriteIds = session?.user?.id
    ? await getUserFavoriteIds(session.user.id)
    : new Set<string>();

  return (
    <ProgressionDetail
      genre={genre}
      progression={progression}
      songs={songs}
      favoriteIds={Array.from(favoriteIds)}
    />
  );
}
