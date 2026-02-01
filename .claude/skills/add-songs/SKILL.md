---
name: add-songs
description: Sincroniza cambios de la BD con data.md y procesa canciones nuevas automáticamente.
disable-model-invocation: true
allowed-tools: Read, Edit, Write, Bash, Grep, Glob, WebFetch
---

# Add Songs Skill

Primero sincroniza cambios de la BD → `data.md` (para reflejar ediciones hechas desde admin), luego procesa canciones nuevas desde `.data/data.md` y las agrega a la base de datos **automáticamente**.

## Formato del archivo data.md

```
- URL, género, progresión, startTime, duration, tonalidad, modo, dificultad
```

Ejemplo completo:
```
- https://youtube.com/watch?v=xxx, salsa, I-IV-V-I, 10, 10, F, major, beginner
```

Las líneas procesadas tienen `[ADDED]` al inicio:
```
- [ADDED] https://youtube.com/watch?v=xxx, salsa, I-IV-V-I, 10, 10, F, major, beginner | Título - Artista
```

Las líneas editadas tienen `[EDITED]` al inicio (para actualizar registros existentes):
```
- [EDITED] https://youtube.com/watch?v=xxx, salsa, I-IV-V-I, 10, 10, F, major, beginner | Título - Artista
```

## Instrucciones - Ejecución Automática

### Paso 0: Sincronización con Base de Datos

**IMPORTANTE:** Antes de procesar canciones nuevas, verificar si hay cambios en la BD que no estén reflejados en `data.md`.

1. **Consultar todas las canciones de la BD:**
   ```bash
   npx dotenv -e .env -- tsx -e "
   import { PrismaClient } from '@prisma/client';
   import { PrismaNeonHttp } from '@prisma/adapter-neon';
   const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, {});
   const prisma = new PrismaClient({ adapter });
   prisma.song.findMany({ include: { genre: true, progression: true } })
     .then(songs => console.log(JSON.stringify(songs, null, 2)))
     .finally(() => prisma.\$disconnect());
   "
   ```

2. **Comparar con las líneas `[ADDED]` en data.md:**
   - Para cada canción en la BD, verificar si existe una línea correspondiente en data.md
   - Comparar: youtubeId, genreId, progressionId (numerals), startTime, duration, key, mode, difficulty

3. **Si hay diferencias:**
   - **Canción en BD pero no en data.md:** Agregar línea con formato:
     ```
     - [ADDED] https://youtube.com/watch?v=YOUTUBE_ID, GENRE, PROGRESSION, START_TIME, DURATION, KEY, MODE, DIFFICULTY | Título - Artista
     ```
   - **Canción modificada en BD:** Actualizar la línea correspondiente en data.md con los nuevos valores
   - **Canción eliminada de BD:** Marcar la línea con `[DELETED]` para referencia histórica

4. **Log de cambios:** Reportar qué líneas fueron sincronizadas antes de continuar

---

### Pasos de Procesamiento

1. **Leer** `.data/data.md`

2. **Filtrar** líneas pendientes:
   - Líneas sin `[ADDED]` y sin `#` → canciones nuevas
   - Líneas con `[EDITED]` → canciones existentes que necesitan actualización

3. **Para cada canción pendiente, parsear la línea:**
   - Campo 1: URL (extraer YouTube ID después de `v=`)
   - Campo 2: género
   - Campo 3: progresión
   - Campo 4: startTime (segundos)
   - Campo 5: duration (segundos)
   - Campo 6: tonalidad (key)
   - Campo 7: modo (major/minor)
   - Campo 8: dificultad (beginner/intermediate/advanced)

4. **Obtener metadatos de YouTube:**
   ```
   https://noembed.com/embed?url=https://www.youtube.com/watch?v=VIDEO_ID
   ```
   Extraer: título y artista

5. **Aplicar valores por defecto si faltan campos:**
   | Campo | Default |
   |-------|---------|
   | género | desconocido |
   | progresión | I-IV-V-I |
   | startTime | 0 |
   | duration | 10 |
   | tonalidad | C |
   | modo | major |
   | dificultad | intermediate |

6. **Normalizar género (fuzzy matching):**
   - Convertir a minúsculas
   - Comparar con géneros existentes en BD
   - Si hay match parcial (ej: "Salsa" -> "salsa", "vallento" -> "vallenato"), usar el existente
   - Si no hay match, crear el género nuevo

   Para verificar géneros existentes, consultar `prisma/seed.ts` o ejecutar:
   ```bash
   npx dotenv -e .env -- tsx -e "
   import { PrismaClient } from '@prisma/client';
   import { PrismaNeonHttp } from '@prisma/adapter-neon';
   const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, {});
   const prisma = new PrismaClient({ adapter });
   prisma.genre.findMany().then(g => console.log(JSON.stringify(g))).finally(() => prisma.\$disconnect());
   "
   ```

7. **Manejar progresión:**
   - Buscar en la tabla de progresiones existentes
   - Si no existe, **crear la progresión nueva** en la BD
   - Los numerales se extraen separando por `-` (ej: "I-IV-V-I" -> ["I", "IV", "V", "I"])

8. **Crear script y ejecutar:**

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
     const progressionName = 'PROGRESSION_NAME'; // ej: 'I-IV-V-I'
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

9. **Actualizar data.md:**
   - Para líneas nuevas: Agregar `[ADDED]` al inicio y `| Título - Artista` al final
   - Para líneas `[EDITED]`: Cambiar `[EDITED]` por `[ADDED]` (el título ya está presente)

10. **Eliminar script temporal** después de procesar

11. **Repetir** para cada canción pendiente

## Progresiones

El ID de cada progresión es igual a su nombre (ej: "I-IV-V-I" tiene id: "I-IV-V-I").

Progresiones existentes en la BD:
- I-IV-V-I, I-V-IV-I, i-iv-V-i, I-IV-I-V, I-V-I-V
- vi-IV-I-V, I-ii-V-I, I-vi-IV-V, i-V-iv-V, i-iv-V
- i-VII-VI-V, i-iv-V-I

Para crear una nueva progresión, usar el nombre como ID (ej: "ii-V-I" → id: "ii-V-I").

## Géneros Conocidos

| ID | name | label |
|----|------|-------|
| salsa | salsa | Salsa |
| cumbia | cumbia | Cumbia |
| vallenato | vallenato | Vallenato |
| bambuco | bambuco | Bambuco |

Para géneros nuevos: id = nombre en minúsculas sin espacios, label = nombre capitalizado.

## Fuzzy Matching de Géneros

Algoritmo simple:
1. Convertir input a minúsculas
2. Buscar match exacto
3. Si no hay match, buscar si algún género existente **contiene** el input o viceversa
4. Si no hay match, verificar errores comunes de tipeo (distancia de 1-2 caracteres)
5. Si aún no hay match, crear nuevo género

Ejemplos:
- "Salsa" -> "salsa" (case insensitive)
- "vallento" -> "vallenato" (typo)
- "CUMBIA" -> "cumbia" (case)
- "reggaeton" -> crear nuevo género

## Formato de Tiempo

- startTime y duration se especifican directamente en segundos
- Ejemplo: `10, 15` → startTime: 10, duration: 15

## Generación del Song ID

Formato: `artista-titulo-startTime` en kebab-case
- Minúsculas
- Espacios -> guiones
- Remover caracteres especiales
- Incluir startTime para permitir múltiples fragmentos del mismo video
- Ejemplo: "Alfredo Linares" + "Mambo Rock" + startTime 10 -> `alfredo-linares-mambo-rock-10`
- Si startTime es 0, se puede omitir: `alfredo-linares-mambo-rock`

**Nota:** Un mismo video puede tener múltiples entradas con diferentes fragmentos (startTime/duration) para analizar distintas progresiones en la misma canción.

## Resumen de Ejecución

```
/add-songs
```

1. **Sincroniza BD → data.md** (detecta cambios hechos desde admin)
2. Lee data.md
3. Procesa líneas sin `[ADDED]` (nuevas) y con `[EDITED]` (actualizaciones)
4. Usa defaults para campos faltantes
5. Crea géneros/progresiones si no existen
6. Agrega/actualiza en la BD
7. Marca como `[ADDED]`
8. No requiere input del usuario

## Manejo de [EDITED]

Para líneas marcadas con `[EDITED]`:
1. La canción YA existe en la BD (identificada por título + artista en el sufijo `| Título - Artista`)
2. Buscar el registro existente por el ID generado (artista-titulo en kebab-case)
3. Actualizar TODOS los campos con los nuevos valores de la línea
4. Si hay nueva progresión que no existe, crearla
5. Cambiar `[EDITED]` por `[ADDED]` en data.md
