'use client';

import Link from 'next/link';
import { User, Heart, ChevronRight, Trophy } from 'lucide-react';
import { Card, CardHeader, CardBody, Avatar } from '@heroui/react';

interface PerfilClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    isAdmin?: boolean;
  };
  initials: string;
  favoritesCount: number;
  quizStats: {
    totalQuizzes: number;
    averageScore: number;
  };
}

export function PerfilClient({ user, initials, favoritesCount, quizStats }: PerfilClientProps) {
  return (
    <div className="container max-w-4xl py-8 px-4">
      <div className="flex flex-col md:flex-row items-start gap-8">
        <Card className="w-full md:w-80 shrink-0">
          <CardHeader className="flex flex-col items-center gap-2 pt-6">
            <Avatar
              src={user.image || ''}
              name={initials}
              className="h-24 w-24 text-2xl"
              isBordered
            />
            <p className="font-semibold text-lg">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </CardHeader>
        </Card>

        <div className="flex-1 w-full space-y-6">
          <h1 className="text-2xl font-bold">Mi Perfil</h1>

          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/perfil/favoritos">
              <Card isPressable isHoverable className="group">
                <CardBody className="flex flex-row items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors">
                    <Heart className="w-6 h-6 text-rose-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold">{favoritesCount}</p>
                    <p className="text-sm text-muted-foreground">Canciones favoritas</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-rose-500 transition-colors" />
                </CardBody>
              </Card>
            </Link>

            <Link href="/perfil/estadisticas">
              <Card isPressable isHoverable className="group">
                <CardBody className="flex flex-row items-center gap-4">
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
                </CardBody>
              </Card>
            </Link>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <User className="w-5 h-5" />
              <p className="font-semibold">Información de la cuenta</p>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Correo electrónico</p>
                <p className="font-medium">{user.email}</p>
              </div>
              {user.isAdmin && (
                <div>
                  <p className="text-sm text-muted-foreground">Rol</p>
                  <p className="font-medium text-primary">Administrador</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
