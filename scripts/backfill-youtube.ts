import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { PrismaNeonHttp } from '@prisma/adapter-neon';
import { Difficulty, Mode, PrismaClient } from '@prisma/client';

dotenv.config();

type ExampleInput = {
  id?: string;
  title: string;
  artist: string;
  youtube: string;
  startTime?: number | null;
  duration?: number | null;
  year?: number | null;
  description?: string | null;
  key?: string;
  mode?: Mode;
  difficulty?: Difficulty;
  genreId?: string;
  progressionId?: string;
};

type CliOptions = {
  file: string;
  dryRun: boolean;
};

const DEFAULT_FILE = 'scripts/data/youtube-examples.json';

function parseArgs(argv: string[]): CliOptions {
  let file = DEFAULT_FILE;
  let dryRun = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      dryRun = true;
      continue;
    }

    if (arg === '--file') {
      const next = argv[i + 1];
      if (!next) {
        throw new Error('Missing value for --file');
      }
      file = next;
      i += 1;
    }
  }

  return { file, dryRun };
}

function ensureString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Invalid "${fieldName}". Expected a non-empty string.`);
  }
  return value.trim();
}

function ensureOptionalString(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') {
    throw new Error('Expected optional string value.');
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function ensureOptionalNumber(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error('Expected optional numeric value.');
  }
  return value;
}

function ensureOptionalEnum<T extends string>(
  value: unknown,
  fieldName: string,
  validValues: readonly T[],
): T | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') {
    throw new Error(`Expected "${fieldName}" to be one of ${validValues.join(', ')}`);
  }
  if (!validValues.includes(value as T)) {
    throw new Error(`Invalid "${fieldName}". Expected one of: ${validValues.join(', ')}`);
  }
  return value as T;
}

function extractYoutubeId(input: string): string {
  const trimmed = input.trim();
  const plainIdPattern = /^[A-Za-z0-9_-]{11}$/;

  if (plainIdPattern.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const firstSegment = url.pathname.split('/').filter(Boolean)[0];
      if (firstSegment && plainIdPattern.test(firstSegment)) {
        return firstSegment;
      }
    }

    if (host.endsWith('youtube.com')) {
      const vParam = url.searchParams.get('v');
      if (vParam && plainIdPattern.test(vParam)) {
        return vParam;
      }

      const segments = url.pathname.split('/').filter(Boolean);
      const candidates = [segments[1], segments[0]].filter(Boolean);
      for (const candidate of candidates) {
        if (candidate && plainIdPattern.test(candidate)) {
          return candidate;
        }
      }
    }
  } catch {
    // Fall through to final error.
  }

  throw new Error(
    `Could not parse a valid YouTube ID from "${input}". Provide an 11-char ID or a YouTube URL.`,
  );
}

function slugify(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

function parseExample(value: unknown, index: number): ExampleInput {
  if (typeof value !== 'object' || value === null) {
    throw new Error(`Entry #${index + 1}: expected an object`);
  }

  const entry = value as Record<string, unknown>;
  const parsed: ExampleInput = {
    id: entry.id ? ensureString(entry.id, `entry #${index + 1}.id`) : undefined,
    title: ensureString(entry.title, `entry #${index + 1}.title`),
    artist: ensureString(entry.artist, `entry #${index + 1}.artist`),
    youtube: ensureString(entry.youtube, `entry #${index + 1}.youtube`),
    startTime: ensureOptionalNumber(entry.startTime),
    duration: ensureOptionalNumber(entry.duration),
    year: ensureOptionalNumber(entry.year),
    description: ensureOptionalString(entry.description),
    key: entry.key ? ensureString(entry.key, `entry #${index + 1}.key`) : undefined,
    mode: ensureOptionalEnum(entry.mode, `entry #${index + 1}.mode`, ['major', 'minor']),
    difficulty: ensureOptionalEnum(entry.difficulty, `entry #${index + 1}.difficulty`, [
      'beginner',
      'intermediate',
      'advanced',
    ]),
    genreId: entry.genreId ? ensureString(entry.genreId, `entry #${index + 1}.genreId`) : undefined,
    progressionId: entry.progressionId
      ? ensureString(entry.progressionId, `entry #${index + 1}.progressionId`)
      : undefined,
  };

  return parsed;
}

async function loadExamples(filePath: string): Promise<ExampleInput[]> {
  const absolutePath = path.resolve(process.cwd(), filePath);
  const content = await fs.readFile(absolutePath, 'utf8');
  const raw = JSON.parse(content) as unknown;

  if (!Array.isArray(raw)) {
    throw new Error(`Expected "${filePath}" to contain a JSON array`);
  }

  return raw.map((entry, index) => parseExample(entry, index));
}

function validateCreateFields(example: ExampleInput, debugKey: string): void {
  const missing: string[] = [];
  if (!example.key) missing.push('key');
  if (!example.mode) missing.push('mode');
  if (!example.difficulty) missing.push('difficulty');
  if (!example.genreId) missing.push('genreId');
  if (!example.progressionId) missing.push('progressionId');

  if (missing.length > 0) {
    throw new Error(`Cannot create "${debugKey}". Missing fields: ${missing.join(', ')}`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const connectionString = process.env.DATABASE_URL || '';

  if (!connectionString) {
    throw new Error('DATABASE_URL is not set in environment variables.');
  }

  const examples = await loadExamples(options.file);

  if (examples.length === 0) {
    console.log(`No entries found in ${options.file}. Nothing to do.`);
    return;
  }

  const adapter = new PrismaNeonHttp(connectionString, {});
  const prisma = new PrismaClient({ adapter });

  let created = 0;
  let updated = 0;

  try {
    for (const example of examples) {
      const youtubeId = extractYoutubeId(example.youtube);
      const debugKey = example.id || `${example.artist} - ${example.title}`;

      const existing =
        (example.id
          ? await prisma.song.findUnique({ where: { id: example.id } })
          : await prisma.song.findFirst({
              where: { title: example.title, artist: example.artist },
              orderBy: { createdAt: 'asc' },
            })) || null;

      if (existing) {
        const updateData: Parameters<typeof prisma.song.update>[0]['data'] = {
          youtubeId,
        };

        if (example.startTime !== undefined) updateData.startTime = example.startTime;
        if (example.duration !== undefined) updateData.duration = example.duration;
        if (example.year !== undefined) updateData.year = example.year;
        if (example.description !== undefined) updateData.description = example.description;
        if (example.key !== undefined) updateData.key = example.key;
        if (example.mode !== undefined) updateData.mode = example.mode;
        if (example.difficulty !== undefined) updateData.difficulty = example.difficulty;
        if (example.genreId !== undefined) updateData.genreId = example.genreId;
        if (example.progressionId !== undefined) updateData.progressionId = example.progressionId;

        if (options.dryRun) {
          console.log(`[dry-run] Update song "${existing.id}" (${debugKey})`);
        } else {
          await prisma.song.update({
            where: { id: existing.id },
            data: updateData,
          });
          console.log(`Updated song "${existing.id}" (${debugKey})`);
        }
        updated += 1;
        continue;
      }

      validateCreateFields(example, debugKey);

      const generatedId = example.id || slugify(`${example.artist}-${example.title}-${example.startTime ?? 0}`);
      const createData: Parameters<typeof prisma.song.create>[0]['data'] = {
        id: generatedId,
        title: example.title,
        artist: example.artist,
        key: example.key!,
        mode: example.mode!,
        difficulty: example.difficulty!,
        genreId: example.genreId!,
        progressionId: example.progressionId!,
        youtubeId,
      };

      if (example.startTime !== undefined) createData.startTime = example.startTime;
      if (example.duration !== undefined) createData.duration = example.duration;
      if (example.year !== undefined) createData.year = example.year;
      if (example.description !== undefined) createData.description = example.description;

      if (options.dryRun) {
        console.log(`[dry-run] Create song "${generatedId}" (${debugKey})`);
      } else {
        await prisma.song.create({ data: createData });
        console.log(`Created song "${generatedId}" (${debugKey})`);
      }
      created += 1;
    }

    console.log(`Done. created=${created} updated=${updated} dryRun=${options.dryRun}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Failed to backfill YouTube examples:', error);
  process.exit(1);
});
