import { getGenres } from '@/lib/db/queries/genres';
import { getProgressions } from '@/lib/db/queries/progressions';
import { getSongs } from '@/lib/db/queries/songs';
import { AdminClient } from './admin-client';

export default async function AdminPage() {
  const [genres, progressions, songs] = await Promise.all([
    getGenres(),
    getProgressions(),
    getSongs(),
  ]);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
      <AdminClient genres={genres} progressions={progressions} songs={songs} />
    </div>
  );
}
