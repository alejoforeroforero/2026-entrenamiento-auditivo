import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getUserQuizStats } from '@/lib/db/queries/quiz';
import { EstadisticasClient } from './estadisticas-client';

export default async function EstadisticasPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const stats = await getUserQuizStats(session.user.id);

  return <EstadisticasClient stats={stats} />;
}

export const metadata = {
  title: 'Estadísticas de Quizzes',
  description: 'Ve tu progreso y estadísticas de quizzes',
};
