import { redirect } from 'next/navigation';
import Link from 'next/link';
import { User, Heart, Calendar, ChevronRight, Trophy } from 'lucide-react';
import { auth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getUserFavorites } from '@/lib/db/queries/favorites';
import { getUserQuizStats } from '@/lib/db/queries/quiz';

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
    <div className="container max-w-4xl py-8 px-4">
      <div className="flex flex-col md:flex-row items-start gap-8">
        <Card className="w-full md:w-80 shrink-0">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{session.user.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{session.user.email}</p>
          </CardHeader>
        </Card>

        <div className="flex-1 w-full space-y-6">
          <h1 className="text-2xl font-bold">Mi Perfil</h1>

          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/perfil/favoritos">
              <Card className="hover:border-rose-500/50 transition-colors cursor-pointer group">
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors">
                    <Heart className="w-6 h-6 text-rose-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold">{favorites.length}</p>
                    <p className="text-sm text-muted-foreground">Canciones favoritas</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-rose-500 transition-colors" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/perfil/estadisticas">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold">{quizStats.totalQuizzes}</p>
                    <p className="text-sm text-muted-foreground">
                      Quizzes completados
                      {quizStats.totalQuizzes > 0 && (
                        <span className="ml-1">
                          · {Math.round(quizStats.averageScore)}% promedio
                        </span>
                      )}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Información de la cuenta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">{session.user.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Correo electrónico</p>
                <p className="font-medium">{session.user.email}</p>
              </div>
              {session.user.isAdmin && (
                <div>
                  <p className="text-sm text-muted-foreground">Rol</p>
                  <p className="font-medium text-primary">Administrador</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
