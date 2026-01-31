import { redirect } from 'next/navigation';

export default async function GenrePage({
  params,
}: {
  params: Promise<{ genre: string }>;
}) {
  const { genre } = await params;
  redirect(`/${genre}/progresiones`);
}
