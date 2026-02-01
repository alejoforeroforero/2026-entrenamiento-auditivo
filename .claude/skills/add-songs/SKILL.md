---
name: add-songs
description: Procesa canciones nuevas desde .data/new.md y las agrega a la base de datos automáticamente.
disable-model-invocation: true
allowed-tools: Read, Edit, Write, Bash, Grep, Glob, WebFetch
---

# Add Songs Skill

Procesa canciones nuevas desde `.data/new.md` y las agrega a la base de datos **automáticamente**.

## Archivos

- `.data/new.md` → Entradas nuevas a procesar
- `.data/data.md` → Historial de canciones agregadas

## Formato de entrada (new.md)

```
- URL, género, progresión, startTime, duration, tonalidad, modo, dificultad
```

Ejemplo:
```
- https://youtube.com/watch?v=xxx, salsa, I-IV-V-I, 10, 10, F, major, beginner
```

## Instrucciones - Ejecución Automática

### Paso 1: Leer new.md

Leer `.data/new.md` y filtrar líneas pendientes (sin `#` al inicio).

### Paso 2: Para cada canción pendiente

1. **Parsear la línea:**
   - Campo 1: URL (extraer YouTube ID después de `v=`)
   - Campo 2: género
   - Campo 3: progresión
   - Campo 4: startTime (segundos)
   - Campo 5: duration (segundos)
   - Campo 6: tonalidad (key)
   - Campo 7: modo (major/minor)
   - Campo 8: dificultad (beginner/intermediate/advanced)

2. **Obtener metadatos de YouTube:**
   ```
   https://noembed.com/embed?url=https://www.youtube.com/watch?v=VIDEO_ID
   ```
   Extraer: título y artista

3. **Aplicar valores por defecto si faltan campos:**
   | Campo | Default |
   |-------|---------|
   | género | desconocido |
   | progresión | I-IV-V-I |
   | startTime | 0 |
   | duration | 10 |
   | tonalidad | C |
   | modo | major |
   | dificultad | intermediate |

4. **Normalizar género (fuzzy matching):**
   - Convertir a minúsculas
   - Comparar con géneros existentes en BD
   - Si hay match parcial, usar el existente
   - Si no hay match, crear el género nuevo

   Para verificar géneros existentes:
   ```bash
   npx dotenv -e .env -- tsx -e "
   import { PrismaClient } from '@prisma/client';
   import { PrismaNeonHttp } from '@prisma/adapter-neon';
   const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, {});
   const prisma = new PrismaClient({ adapter });
   prisma.genre.findMany().then(g => console.log(JSON.stringify(g))).finally(() => prisma.\$disconnect());
   "
   ```

5. **Manejar progresión:**
   - Buscar en la tabla de progresiones existentes
   - Si no existe, **crear la progresión nueva** en la BD
   - Los numerales se extraen separando por `-`

### Paso 3: Crear script y ejecutar

Escribir `scripts/add-song-temp.ts`:
```typescript
import { PrismaClient, Difficulty, Mode } from '@prisma/client';
import { PrismaNeonHttp } from '@prisma/adapter-neon';

const connectionString = process.env.DATABASE_URL || '';
if (!connectionString) { console.error('DATABASE_URL not set'); process.exit(1); }

const adapter = new PrismaNeonHttp(connectionString, {});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Si el género no existe, crearlo
  const genre = await prisma.genre.upsert({
    where: { id: 'GENRE_ID' },
    update: {},
    create: { id: 'GENRE_ID', name: 'GENRE_NAME', label: 'Genre Label' }
  });

  // Si la progresión no existe, crearla (id = name)
  const progressionName = 'PROGRESSION_NAME';
  const progression = await prisma.progression.upsert({
    where: { id: progressionName },
    update: {},
    create: {
      id: progressionName,
      name: progressionName,
      numerals: ['NUMERAL1', 'NUMERAL2', ...],
      description: 'Progresión ' + progressionName
    }
  });

  // Crear la canción
  const song = {
    id: 'SONG_SLUG',
    title: 'TITULO',
    artist: 'ARTISTA',
    genreId: genre.id,
    progressionId: progression.id,
    key: 'KEY',
    mode: Mode.MODO,
    youtubeId: 'YOUTUBE_ID',
    difficulty: Difficulty.DIFICULTAD,
    year: null,
    description: null,
    startTime: START_SECONDS,
    duration: DURATION_SECONDS,
  };

  await prisma.song.upsert({
    where: { id: song.id },
    update: { ...song },
    create: song,
  });

  console.log('✅ Added:', song.title, '-', song.artist);
}

main()
  .catch((e) => { console.error('❌', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

Ejecutar:
```bash
npx dotenv -e .env -- tsx scripts/add-song-temp.ts
```

### Paso 4: Mover línea a data.md

1. Agregar la línea procesada a `.data/data.md` con formato:
   ```
   - [ADDED] URL, género, progresión, startTime, duration, tonalidad, modo, dificultad | Título - Artista
   ```

2. Eliminar la línea de `.data/new.md`

### Paso 5: Limpiar

1. Eliminar script temporal `scripts/add-song-temp.ts`
2. Repetir para cada canción pendiente
3. Al finalizar, `.data/new.md` debe quedar solo con el encabezado

## Progresiones

El ID de cada progresión es igual a su nombre (ej: "I-IV-V-I" tiene id: "I-IV-V-I").

Para crear una nueva progresión, usar el nombre como ID.

## Géneros Conocidos

| ID | name | label |
|----|------|-------|
| salsa | salsa | Salsa |
| cumbia | cumbia | Cumbia |
| vallenato | vallenato | Vallenato |
| bambuco | bambuco | Bambuco |

Para géneros nuevos: id = nombre en minúsculas sin espacios, label = nombre capitalizado.

## Generación del Song ID

Formato: `artista-titulo-startTime` en kebab-case
- Minúsculas
- Espacios -> guiones
- Remover caracteres especiales
- Incluir startTime para permitir múltiples fragmentos del mismo video
- Si startTime es 0, se puede omitir

## Resumen de Ejecución

```
/add-songs
```

1. Lee `.data/new.md`
2. Procesa líneas sin `#`
3. Obtiene metadatos de YouTube
4. Crea géneros/progresiones si no existen
5. Agrega a la BD
6. Mueve líneas procesadas a `.data/data.md` con `[ADDED] ... | Título - Artista`
7. Limpia `.data/new.md` (deja solo encabezado)
