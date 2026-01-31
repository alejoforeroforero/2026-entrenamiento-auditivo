import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSongsForProgressionInGenre } from '@/lib/data/genre-filters';
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

  const progression = await getProgressionById(id);

  if (!progression) {
    notFound();
  }

  const songs = await getSongsForProgressionInGenre(id, genre);

  return (
    <ProgressionDetail
      genre={genre}
      progression={progression}
      songs={songs}
    />
  );
}
