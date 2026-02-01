'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { Difficulty, Mode } from '@prisma/client';

// Genre Actions
export async function createGenre(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const label = formData.get('label') as string;

  await prisma.genre.create({
    data: { id, name, label },
  });

  revalidatePath('/admin');
  revalidatePath('/');
}

export async function updateGenre(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const label = formData.get('label') as string;

  await prisma.genre.update({
    where: { id },
    data: { name, label },
  });

  revalidatePath('/admin');
  revalidatePath('/');
  revalidatePath(`/${id}`);
}

export async function deleteGenre(formData: FormData) {
  const id = formData.get('id') as string;

  await prisma.genre.delete({
    where: { id },
  });

  revalidatePath('/admin');
  revalidatePath('/');
}

// Progression Actions
export async function createProgression(formData: FormData) {
  const name = formData.get('name') as string;
  const numerals = (formData.get('numerals') as string).split(',').map((n) => n.trim());
  const description = formData.get('description') as string || null;
  const difficulty = formData.get('difficulty') as Difficulty;

  await prisma.progression.create({
    data: { id: name, name, numerals, description, difficulty },
  });

  revalidatePath('/admin');
}

export async function updateProgression(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const numerals = (formData.get('numerals') as string).split(',').map((n) => n.trim());
  const description = formData.get('description') as string || null;
  const difficulty = formData.get('difficulty') as Difficulty;

  await prisma.progression.update({
    where: { id },
    data: { name, numerals, description, difficulty },
  });

  revalidatePath('/admin');
}

export async function deleteProgression(formData: FormData) {
  const id = formData.get('id') as string;

  await prisma.progression.delete({
    where: { id },
  });

  revalidatePath('/admin');
}

// Song Actions
export async function createSong(formData: FormData) {
  const title = formData.get('title') as string;
  const artist = formData.get('artist') as string;
  const key = formData.get('key') as string;
  const mode = formData.get('mode') as Mode;
  const year = formData.get('year') ? parseInt(formData.get('year') as string) : null;
  const description = formData.get('description') as string || null;
  const difficulty = formData.get('difficulty') as Difficulty;
  const youtubeId = formData.get('youtubeId') as string || null;
  const startTime = formData.get('startTime') ? parseInt(formData.get('startTime') as string) : null;
  const duration = formData.get('duration') ? parseInt(formData.get('duration') as string) : null;
  const genreId = formData.get('genreId') as string;
  const progressionId = formData.get('progressionId') as string;

  await prisma.song.create({
    data: {
      title,
      artist,
      key,
      mode,
      year,
      description,
      difficulty,
      youtubeId,
      startTime,
      duration,
      genreId,
      progressionId,
    },
  });

  revalidatePath('/admin');
  revalidatePath(`/${genreId}`);
}

export async function updateSong(formData: FormData) {
  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const artist = formData.get('artist') as string;
  const key = formData.get('key') as string;
  const mode = formData.get('mode') as Mode;
  const year = formData.get('year') ? parseInt(formData.get('year') as string) : null;
  const description = formData.get('description') as string || null;
  const difficulty = formData.get('difficulty') as Difficulty;
  const youtubeId = formData.get('youtubeId') as string || null;
  const startTime = formData.get('startTime') ? parseInt(formData.get('startTime') as string) : null;
  const duration = formData.get('duration') ? parseInt(formData.get('duration') as string) : null;
  const genreId = formData.get('genreId') as string;
  const progressionId = formData.get('progressionId') as string;

  await prisma.song.update({
    where: { id },
    data: {
      title,
      artist,
      key,
      mode,
      year,
      description,
      difficulty,
      youtubeId,
      startTime,
      duration,
      genreId,
      progressionId,
    },
  });

  revalidatePath('/admin');
  revalidatePath(`/${genreId}`);
}

export async function deleteSong(formData: FormData) {
  const id = formData.get('id') as string;
  const genreId = formData.get('genreId') as string;

  await prisma.song.delete({
    where: { id },
  });

  revalidatePath('/admin');
  revalidatePath(`/${genreId}`);
}
