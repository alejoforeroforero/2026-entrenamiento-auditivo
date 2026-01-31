import { PrismaClient, Difficulty, Mode } from '@prisma/client';
import { PrismaNeonHttp } from '@prisma/adapter-neon';

const connectionString = process.env.DATABASE_URL || '';

console.log('📡 DATABASE_URL:', connectionString.substring(0, 50) + '...');

if (!connectionString) {
  console.error('❌ DATABASE_URL not set. Please provide it as an environment variable.');
  process.exit(1);
}

console.log('📡 Connecting to database...');

const adapter = new PrismaNeonHttp(connectionString, {});

const prisma = new PrismaClient({ adapter });

const GENRES = [
  { id: 'salsa', name: 'salsa', label: 'Salsa' },
  { id: 'cumbia', name: 'cumbia', label: 'Cumbia' },
  { id: 'vallenato', name: 'vallenato', label: 'Vallenato' },
  { id: 'bambuco', name: 'bambuco', label: 'Bambuco' },
];

const PROGRESSIONS = [
  {
    id: '1',
    name: 'I-IV-V-I',
    numerals: ['I', 'IV', 'V', 'I'],
    description: 'Cadencia perfecta, la progresión más común en música occidental',
  },
  {
    id: '2',
    name: 'I-V-IV-I',
    numerals: ['I', 'V', 'IV', 'I'],
    description: 'Variante con cadencia plagal al final',
  },
  {
    id: '3',
    name: 'i-iv-V-i',
    numerals: ['i', 'iv', 'V', 'i'],
    description: 'Progresión menor con dominante mayor (cadencia menor)',
  },
  {
    id: '4',
    name: 'I-IV-I-V',
    numerals: ['I', 'IV', 'I', 'V'],
    description: 'Patrón con cadencia suspendida',
  },
  {
    id: '5',
    name: 'I-V-I-V',
    numerals: ['I', 'V', 'I', 'V'],
    description: 'Alternancia tónica-dominante',
  },
  {
    id: '6',
    name: 'vi-IV-I-V',
    numerals: ['vi', 'IV', 'I', 'V'],
    description: 'Progresión del pop moderno (axis progression)',
  },
  {
    id: '7',
    name: 'I-ii-V-I',
    numerals: ['I', 'ii', 'V', 'I'],
    description: 'Progresión con supertónica, común en jazz y bossa',
  },
  {
    id: '8',
    name: 'I-vi-IV-V',
    numerals: ['I', 'vi', 'IV', 'V'],
    description: 'Progresión "doo-wop" o del 50s',
  },
  {
    id: '9',
    name: 'i-V-iv-V',
    numerals: ['i', 'V', 'iv', 'V'],
    description: 'Progresión menor con movimiento V-iv-V',
  },
  {
    id: '10',
    name: 'i-iv-V',
    numerals: ['i', 'iv', 'V'],
    description: 'Progresión menor clásica de tres acordes',
  },
  {
    id: '11',
    name: 'i-VII-VI-V',
    numerals: ['i', 'VII', 'VI', 'V'],
    description: 'Progresión andaluza (descenso cromático)',
  },
  {
    id: '12',
    name: 'i-iv-V-I',
    numerals: ['i', 'iv', 'V', 'I'],
    description: 'Progresión menor con resolución a mayor (tercera de picardía)',
  },
];

const REPERTOIRE = [
  {
    id: 'ismael-las-caras-lindas',
    title: 'Las Caras Lindas',
    artist: 'Ismael Rivera',
    genreId: 'salsa',
    progressionId: '9',
    key: 'A',
    mode: Mode.minor,
    youtubeId: '7qYeBLp5vdI',
    difficulty: Difficulty.intermediate,
    year: 1978,
    description: 'Clásico de la salsa puertorriqueña, himno de orgullo afrolatino',
    startTime: 45,
    duration: 15,
  },
  {
    id: 'ismael-el-nazareno',
    title: 'El Nazareno',
    artist: 'Ismael Rivera',
    genreId: 'salsa',
    progressionId: '10',
    key: 'G',
    mode: Mode.minor,
    youtubeId: 'w8mWOdeDw20',
    difficulty: Difficulty.intermediate,
    year: 1975,
    description: 'Canción dedicada al Cristo Negro de Portobelo, Panamá',
    startTime: 30,
    duration: 15,
  },
  {
    id: 'ismael-el-incomprendido',
    title: 'El Incomprendido',
    artist: 'Ismael Rivera',
    genreId: 'salsa',
    progressionId: '11',
    key: 'E',
    mode: Mode.minor,
    youtubeId: 'OtDuhf9Y9zU',
    difficulty: Difficulty.intermediate,
    year: 1972,
    description: 'Una de las canciones más emotivas sobre la soledad',
    startTime: 25,
    duration: 15,
  },
  {
    id: 'ismael-mi-negrita',
    title: 'Mi Negrita Me Espera',
    artist: 'Ismael Rivera',
    genreId: 'salsa',
    progressionId: '12',
    key: 'D',
    mode: Mode.minor,
    youtubeId: 'nhnHsG9HHms',
    difficulty: Difficulty.beginner,
    year: 1974,
    description: 'Clásico del sonero mayor con Kako y su Orquesta',
    startTime: 20,
    duration: 15,
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  console.log('📁 Seeding genres...');
  for (const genre of GENRES) {
    await prisma.genre.upsert({
      where: { id: genre.id },
      update: { name: genre.name, label: genre.label },
      create: genre,
    });
  }

  console.log('🎵 Seeding progressions...');
  for (const progression of PROGRESSIONS) {
    await prisma.progression.upsert({
      where: { id: progression.id },
      update: {
        name: progression.name,
        numerals: progression.numerals,
        description: progression.description,
      },
      create: progression,
    });
  }

  console.log('🎤 Seeding songs...');
  for (const song of REPERTOIRE) {
    await prisma.song.upsert({
      where: { id: song.id },
      update: {
        title: song.title,
        artist: song.artist,
        genreId: song.genreId,
        progressionId: song.progressionId,
        key: song.key,
        mode: song.mode,
        youtubeId: song.youtubeId,
        difficulty: song.difficulty,
        year: song.year,
        description: song.description,
        startTime: song.startTime,
        duration: song.duration,
      },
      create: song,
    });
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
