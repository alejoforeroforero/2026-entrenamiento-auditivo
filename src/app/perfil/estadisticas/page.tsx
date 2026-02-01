import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trophy, Target, TrendingUp, AlertCircle, Piano, Music2, ChevronRight } from 'lucide-react';
import { auth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUserQuizStats } from '@/lib/db/queries/quiz';
import { cn } from '@/lib/utils';

export default async function EstadisticasPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const stats = await getUserQuizStats(session.user.id);

  return (
    <div className="container max-w-4xl py-8 px-4">
      <div className="mb-6">
        <Link href="/perfil">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver al perfil
          </Button>
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Estadísticas de Quizzes</h1>

      {stats.totalQuizzes === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Aún no has completado ningún quiz</h2>
            <p className="text-muted-foreground mb-6">
              Completa quizzes para ver tus estadísticas aquí
            </p>
            <Link href="/salsa/quiz">
              <Button>Comenzar un quiz</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              icon={<Trophy className="w-5 h-5" />}
              label="Quizzes completados"
              value={stats.totalQuizzes.toString()}
              color="primary"
            />
            <StatCard
              icon={<Target className="w-5 h-5" />}
              label="Preguntas respondidas"
              value={stats.totalQuestions.toString()}
              color="blue"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Promedio de aciertos"
              value={`${Math.round(stats.averageScore)}%`}
              color="green"
            />
            <StatCard
              icon={<Trophy className="w-5 h-5" />}
              label="Mejor puntuación"
              value={`${Math.round(stats.bestScore)}%`}
              color="amber"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Music2 className="w-5 h-5" />
                  Por género
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(stats.quizzesByGenre).length === 0 ? (
                  <p className="text-muted-foreground text-sm">Sin datos</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(stats.quizzesByGenre).map(([genre, data]) => (
                      <div key={genre} className="flex items-center justify-between">
                        <span className="font-medium">{genre}</span>
                        <div className="text-right">
                          <span className="text-sm text-muted-foreground">
                            {data.quizCount} quiz{data.quizCount !== 1 ? 'zes' : ''} ·{' '}
                          </span>
                          <span className="font-medium">
                            {data.total > 0
                              ? Math.round((data.correct / data.total) * 100)
                              : 0}
                            %
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Piano className="w-5 h-5" />
                  Por modo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <ModeRow
                    icon={<Piano className="w-4 h-4" />}
                    label="Piano"
                    data={stats.quizzesByMode.piano}
                  />
                  <ModeRow
                    icon={<Music2 className="w-4 h-4" />}
                    label="Repertorio"
                    data={stats.quizzesByMode.repertoire}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {stats.mostMissedProgressions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Áreas de mejora
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Progresiones que más te han costado:
                </p>
                <div className="space-y-2">
                  {stats.mostMissedProgressions.map((item) => (
                    <Link
                      key={item.progressionId}
                      href={`/${item.genreId}/progresiones/${item.progressionId}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                    >
                      <span className="font-medium group-hover:text-primary transition-colors">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {item.missCount} error{item.missCount !== 1 ? 'es' : ''}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {stats.recentQuizzes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quizzes recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">{quiz.genreName}</p>
                        <p className="text-xs text-muted-foreground">
                          {quiz.mode === 'piano' ? 'Piano' : 'Repertorio'} ·{' '}
                          {quiz.completedAt
                            ? new Date(quiz.completedAt).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                              })
                            : 'En progreso'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">
                          {quiz.correctAnswers}/{quiz.totalQuestions}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((quiz.correctAnswers / quiz.totalQuestions) * 100)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'primary' | 'blue' | 'green' | 'amber';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    amber: 'bg-amber-500/10 text-amber-500',
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', colorClasses[color])}>
          {icon}
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

interface ModeRowProps {
  icon: React.ReactNode;
  label: string;
  data: { total: number; correct: number; quizCount: number };
}

function ModeRow({ icon, label, data }: ModeRowProps) {
  const percentage = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <div className="text-right">
        {data.quizCount > 0 ? (
          <>
            <span className="text-sm text-muted-foreground">
              {data.quizCount} quiz{data.quizCount !== 1 ? 'zes' : ''} ·{' '}
            </span>
            <span className="font-medium">{percentage}%</span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">Sin datos</span>
        )}
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Estadísticas de Quizzes',
  description: 'Ve tu progreso y estadísticas de quizzes',
};
