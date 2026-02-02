import { redirect } from 'next/navigation';
import { getProgressionsForGenre } from '@/lib/data/genre-filters';

export default async function ProgresionesPage({
  params,
}: {
  params: Promise<{ genre: string }>;
}) {
  const { genre } = await params;
  const progressions = await getProgressionsForGenre(genre);

  if (progressions.length > 0) {
    redirect(`/${genre}/progresiones/${progressions[0].id}`);
  }

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <p className="text-muted-foreground">
        No hay progresiones disponibles para este género.
      </p>
    </div>
  );
}
