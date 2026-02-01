import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getProgressionsForGenre, hasContentForGenre } from '@/lib/data/genre-filters';
import { GenreSidebar } from './genre-sidebar';

async function getGenreById(genreId: string) {
  return prisma.genre.findUnique({
    where: { id: genreId },
  });
}

export default async function GenreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ genre: string }>;
}) {
  const { genre } = await params;

  const genreData = await getGenreById(genre);

  if (!genreData) {
    notFound();
  }

  const [progressions, hasContent] = await Promise.all([
    getProgressionsForGenre(genre),
    hasContentForGenre(genre),
  ]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      <GenreSidebar
        genre={genre}
        genreLabel={genreData.label}
        progressions={progressions}
        hasContent={hasContent}
      />
      <div className="flex-1 min-w-0 px-4 md:px-8 py-4 md:py-6 pb-24 md:pb-6">
        {children}
      </div>
    </div>
  );
}
