'use client';

import { useState } from 'react';
import { Genre, Progression, Song } from '@prisma/client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Music, ListMusic, Disc } from 'lucide-react';
import {
  createGenre,
  updateGenre,
  deleteGenre,
  createProgression,
  updateProgression,
  deleteProgression,
  createSong,
  updateSong,
  deleteSong,
} from './actions';

type SongWithRelations = Song & {
  genre: Genre;
  progression: Progression;
};

interface AdminClientProps {
  genres: Genre[];
  progressions: Progression[];
  songs: SongWithRelations[];
}

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;
const MODES = ['major', 'minor'] as const;

export function AdminClient({ genres, progressions, songs }: AdminClientProps) {
  return (
    <Tabs defaultValue="genres">
      <TabsList className="mb-6">
        <TabsTrigger value="genres" className="gap-2">
          <Disc className="size-4" />
          Géneros ({genres.length})
        </TabsTrigger>
        <TabsTrigger value="progressions" className="gap-2">
          <ListMusic className="size-4" />
          Progresiones ({progressions.length})
        </TabsTrigger>
        <TabsTrigger value="songs" className="gap-2">
          <Music className="size-4" />
          Canciones ({songs.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="genres">
        <GenresTab genres={genres} />
      </TabsContent>

      <TabsContent value="progressions">
        <ProgressionsTab progressions={progressions} />
      </TabsContent>

      <TabsContent value="songs">
        <SongsTab songs={songs} genres={genres} progressions={progressions} />
      </TabsContent>
    </Tabs>
  );
}

function GenresTab({ genres }: { genres: Genre[] }) {
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Géneros Musicales</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Nuevo Género
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Género</DialogTitle>
            </DialogHeader>
            <form action={createGenre} className="space-y-4">
              <div>
                <label className="text-sm font-medium">ID (slug)</label>
                <Input name="id" placeholder="salsa" required />
              </div>
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <Input name="name" placeholder="Salsa" required />
              </div>
              <div>
                <label className="text-sm font-medium">Etiqueta</label>
                <Input name="label" placeholder="Salsa Clásica" required />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit">Crear</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {genres.map((genre) => (
          <Card key={genre.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-start">
                <span>{genre.name}</span>
                <div className="flex gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingGenre(genre)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Género</DialogTitle>
                      </DialogHeader>
                      <form action={updateGenre} className="space-y-4">
                        <input type="hidden" name="id" value={genre.id} />
                        <div>
                          <label className="text-sm font-medium">Nombre</label>
                          <Input
                            name="name"
                            defaultValue={genre.name}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Etiqueta</label>
                          <Input
                            name="label"
                            defaultValue={genre.label}
                            required
                          />
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="outline">
                              Cancelar
                            </Button>
                          </DialogClose>
                          <Button type="submit">Guardar</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <form action={deleteGenre}>
                    <input type="hidden" name="id" value={genre.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </form>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{genre.label}</p>
              <Badge variant="outline" className="mt-2">
                ID: {genre.id}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProgressionsTab({ progressions }: { progressions: Progression[] }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Progresiones Armónicas</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Nueva Progresión
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Progresión</DialogTitle>
            </DialogHeader>
            <form action={createProgression} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <Input name="name" placeholder="I-IV-V-I" required />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Numerales (separados por coma)
                </label>
                <Input name="numerals" placeholder="I, IV, V, I" required />
              </div>
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Input name="description" placeholder="Progresión clásica..." />
              </div>
              <div>
                <label className="text-sm font-medium">Dificultad</label>
                <Select name="difficulty" defaultValue="beginner">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d === 'beginner'
                          ? 'Principiante'
                          : d === 'intermediate'
                            ? 'Intermedio'
                            : 'Avanzado'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit">Crear</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {progressions.map((prog) => (
          <Card key={prog.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-start">
                <span>{prog.name}</span>
                <div className="flex gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Pencil className="size-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Progresión</DialogTitle>
                      </DialogHeader>
                      <form action={updateProgression} className="space-y-4">
                        <input type="hidden" name="id" value={prog.id} />
                        <div>
                          <label className="text-sm font-medium">Nombre</label>
                          <Input name="name" defaultValue={prog.name} required />
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            Numerales (separados por coma)
                          </label>
                          <Input
                            name="numerals"
                            defaultValue={prog.numerals.join(', ')}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            Descripción
                          </label>
                          <Input
                            name="description"
                            defaultValue={prog.description || ''}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            Dificultad
                          </label>
                          <Select
                            name="difficulty"
                            defaultValue={prog.difficulty}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DIFFICULTIES.map((d) => (
                                <SelectItem key={d} value={d}>
                                  {d === 'beginner'
                                    ? 'Principiante'
                                    : d === 'intermediate'
                                      ? 'Intermedio'
                                      : 'Avanzado'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="outline">
                              Cancelar
                            </Button>
                          </DialogClose>
                          <Button type="submit">Guardar</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <form action={deleteProgression}>
                    <input type="hidden" name="id" value={prog.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </form>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1 mb-2">
                {prog.numerals.map((n, i) => (
                  <Badge key={i} variant="secondary">
                    {n}
                  </Badge>
                ))}
              </div>
              {prog.description && (
                <p className="text-sm text-muted-foreground mb-2">
                  {prog.description}
                </p>
              )}
              <Badge
                variant={
                  prog.difficulty === 'beginner'
                    ? 'default'
                    : prog.difficulty === 'intermediate'
                      ? 'secondary'
                      : 'destructive'
                }
              >
                {prog.difficulty === 'beginner'
                  ? 'Principiante'
                  : prog.difficulty === 'intermediate'
                    ? 'Intermedio'
                    : 'Avanzado'}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SongsTab({
  songs,
  genres,
  progressions,
}: {
  songs: SongWithRelations[];
  genres: Genre[];
  progressions: Progression[];
}) {
  const [filterGenre, setFilterGenre] = useState<string>('all');

  const filteredSongs =
    filterGenre === 'all'
      ? songs
      : songs.filter((s) => s.genreId === filterGenre);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Canciones</h2>
          <Select value={filterGenre} onValueChange={setFilterGenre}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar por género" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {genres.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Nueva Canción
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Canción</DialogTitle>
            </DialogHeader>
            <form action={createSong} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Título</label>
                  <Input name="title" required />
                </div>
                <div>
                  <label className="text-sm font-medium">Artista</label>
                  <Input name="artist" required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Tonalidad</label>
                  <Select name="key" defaultValue="C">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTES.map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Modo</label>
                  <Select name="mode" defaultValue="major">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MODES.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m === 'major' ? 'Mayor' : 'Menor'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Año</label>
                  <Input name="year" type="number" placeholder="1975" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Género</label>
                  <Select name="genreId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Progresión</label>
                  <Select name="progressionId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {progressions.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Dificultad</label>
                <Select name="difficulty" defaultValue="beginner">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d === 'beginner'
                          ? 'Principiante'
                          : d === 'intermediate'
                            ? 'Intermedio'
                            : 'Avanzado'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Input name="description" placeholder="Opcional..." />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">YouTube ID</label>
                  <Input name="youtubeId" placeholder="dQw4w9WgXcQ" />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Inicio (segundos)
                  </label>
                  <Input name="startTime" type="number" placeholder="0" />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Duración (segundos)
                  </label>
                  <Input name="duration" type="number" placeholder="30" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit">Crear</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSongs.map((song) => (
          <Card key={song.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-start text-base">
                <div>
                  <span className="block">{song.title}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {song.artist}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Pencil className="size-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Editar Canción</DialogTitle>
                      </DialogHeader>
                      <form action={updateSong} className="space-y-4">
                        <input type="hidden" name="id" value={song.id} />
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">
                              Título
                            </label>
                            <Input
                              name="title"
                              defaultValue={song.title}
                              required
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              Artista
                            </label>
                            <Input
                              name="artist"
                              defaultValue={song.artist}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium">
                              Tonalidad
                            </label>
                            <Select name="key" defaultValue={song.key}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {NOTES.map((n) => (
                                  <SelectItem key={n} value={n}>
                                    {n}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Modo</label>
                            <Select name="mode" defaultValue={song.mode}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {MODES.map((m) => (
                                  <SelectItem key={m} value={m}>
                                    {m === 'major' ? 'Mayor' : 'Menor'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Año</label>
                            <Input
                              name="year"
                              type="number"
                              defaultValue={song.year || ''}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">
                              Género
                            </label>
                            <Select name="genreId" defaultValue={song.genreId}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {genres.map((g) => (
                                  <SelectItem key={g.id} value={g.id}>
                                    {g.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              Progresión
                            </label>
                            <Select
                              name="progressionId"
                              defaultValue={song.progressionId}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {progressions.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            Dificultad
                          </label>
                          <Select
                            name="difficulty"
                            defaultValue={song.difficulty}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DIFFICULTIES.map((d) => (
                                <SelectItem key={d} value={d}>
                                  {d === 'beginner'
                                    ? 'Principiante'
                                    : d === 'intermediate'
                                      ? 'Intermedio'
                                      : 'Avanzado'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            Descripción
                          </label>
                          <Input
                            name="description"
                            defaultValue={song.description || ''}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium">
                              YouTube ID
                            </label>
                            <Input
                              name="youtubeId"
                              defaultValue={song.youtubeId || ''}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              Inicio (seg)
                            </label>
                            <Input
                              name="startTime"
                              type="number"
                              defaultValue={song.startTime || ''}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              Duración (seg)
                            </label>
                            <Input
                              name="duration"
                              type="number"
                              defaultValue={song.duration || ''}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="outline">
                              Cancelar
                            </Button>
                          </DialogClose>
                          <Button type="submit">Guardar</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <form action={deleteSong}>
                    <input type="hidden" name="id" value={song.id} />
                    <input type="hidden" name="genreId" value={song.genreId} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </form>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-1">
                <Badge>{song.genre.name}</Badge>
                <Badge variant="outline">
                  {song.key} {song.mode === 'major' ? 'Mayor' : 'menor'}
                </Badge>
                {song.year && <Badge variant="secondary">{song.year}</Badge>}
              </div>
              <div className="text-sm text-muted-foreground">
                Progresión: {song.progression.name}
              </div>
              <Badge
                variant={
                  song.difficulty === 'beginner'
                    ? 'default'
                    : song.difficulty === 'intermediate'
                      ? 'secondary'
                      : 'destructive'
                }
              >
                {song.difficulty === 'beginner'
                  ? 'Principiante'
                  : song.difficulty === 'intermediate'
                    ? 'Intermedio'
                    : 'Avanzado'}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
