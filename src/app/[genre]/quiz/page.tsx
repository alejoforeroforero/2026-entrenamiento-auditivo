import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { QuizClient } from './quiz-client';

interface QuizPageProps {
  params: Promise<{ genre: string }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { genre: genreId } = await params;

  const genre = await prisma.genre.findUnique({
    where: { id: genreId },
  });

  if (!genre) {
    notFound();
  }

  const session = await auth();
  const isAuthenticated = !!session?.user;

  return (
    <QuizClient
      genre={genreId}
      genreName={genre.label}
      isAuthenticated={isAuthenticated}
    />
  );
}

export async function generateMetadata({ params }: QuizPageProps) {
  const { genre: genreId } = await params;

  const genre = await prisma.genre.findUnique({
    where: { id: genreId },
  });

  return {
    title: genre ? `Quiz - ${genre.label}` : 'Quiz',
    description: 'Pon a prueba tu oído identificando progresiones armónicas',
  };
}
