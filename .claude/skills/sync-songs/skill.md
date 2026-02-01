---
name: sync-songs
description: Sincroniza la base de datos con data.md (detecta cambios hechos desde admin).
disable-model-invocation: true
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Sync Songs Skill

Sincroniza el estado de la base de datos con `.data/data.md`. Útil para reflejar cambios hechos desde el panel de administración.

## Cuándo usar

- Después de editar canciones desde el admin de la BD
- Para verificar que data.md refleja el estado actual de la BD
- Antes de hacer cambios manuales a data.md

## Instrucciones

### Paso 1: Consultar todas las canciones de la BD

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

### Paso 2: Leer data.md

Leer `.data/data.md` y extraer las líneas `[ADDED]`.

### Paso 3: Comparar y detectar diferencias

Para cada canción en la BD, verificar si existe una línea correspondiente en data.md.

Comparar campos:
- youtubeId (extraído de la URL)
- genreId
- progressionId (numerals)
- startTime
- duration
- key
- mode
- difficulty

### Paso 4: Aplicar cambios a data.md

1. **Canción en BD pero no en data.md:**
   Agregar línea con formato:
   ```
   - [ADDED] https://youtube.com/watch?v=YOUTUBE_ID, GENRE, PROGRESSION, START_TIME, DURATION, KEY, MODE, DIFFICULTY | Título - Artista
   ```

2. **Canción modificada en BD:**
   Actualizar la línea correspondiente en data.md con los nuevos valores

3. **Canción eliminada de BD:**
   Marcar la línea con `[DELETED]` para referencia histórica:
   ```
   - [DELETED] https://youtube.com/watch?v=xxx, ... | Título - Artista
   ```

### Paso 5: Reportar cambios

Mostrar un resumen de los cambios realizados:
- Líneas agregadas
- Líneas actualizadas
- Líneas marcadas como eliminadas

## Formato de línea en data.md

```
- [ADDED] URL, género, progresión, startTime, duration, tonalidad, modo, dificultad | Título - Artista
```

## Resumen de Ejecución

```
/sync-songs
```

1. Consulta todas las canciones de la BD
2. Compara con líneas `[ADDED]` en data.md
3. Agrega/actualiza/marca eliminadas según diferencias
4. Reporta cambios realizados
