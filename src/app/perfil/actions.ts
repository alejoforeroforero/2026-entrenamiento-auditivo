'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { addFavorite, removeFavorite, isFavorite } from '@/lib/db/queries/favorites';

export async function toggleFavorite(songId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: 'No autenticado' };
  }

  const userId = session.user.id;
  const favorited = await isFavorite(userId, songId);

  if (favorited) {
    await removeFavorite(userId, songId);
  } else {
    await addFavorite(userId, songId);
  }

  revalidatePath('/perfil/favoritos');

  return { favorited: !favorited };
}
