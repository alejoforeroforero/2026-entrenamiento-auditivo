import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getUserFavorites } from '@/lib/db/queries/favorites';
import { FavoritosClient } from './favoritos-client';

export default async function FavoritosPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const favorites = await getUserFavorites(session.user.id);

  return <FavoritosClient favorites={favorites} />;
}
