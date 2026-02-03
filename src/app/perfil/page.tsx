import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getUserFavorites } from '@/lib/db/queries/favorites';
import { getUserQuizStats } from '@/lib/db/queries/quiz';
import { PerfilClient } from './perfil-client';

export default async function PerfilPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const [favorites, quizStats] = await Promise.all([
    getUserFavorites(session.user.id),
    getUserQuizStats(session.user.id),
  ]);

  const initials = session.user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  return (
    <PerfilClient
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        isAdmin: session.user.isAdmin,
      }}
      initials={initials}
      favoritesCount={favorites.length}
      quizStats={{
        totalQuizzes: quizStats.totalQuizzes,
        averageScore: quizStats.averageScore,
      }}
    />
  );
}
