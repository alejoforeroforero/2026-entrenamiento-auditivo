'use client';

import { useState } from 'react';
import { Genre, Progression, Song } from '@prisma/client';
import {
  Tabs,
  Tab,
  Button,
  Input,
  Chip,
  Card,
  CardHeader,
  CardBody,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  useDisclosure,
} from '@heroui/react';
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
    <Tabs defaultSelectedKey="genres" classNames={{ panel: 'pt-6' }}>
      <Tab
        key="genres"
        title={
          <div className="flex items-center gap-2">
            <Disc className="size-4" />
            <span>Géneros ({genres.length})</span>
          </div>
        }
      >
        <GenresTab genres={genres} />
      </Tab>
      <Tab
        key="progressions"
        title={
          <div className="flex items-center gap-2">
            <ListMusic className="size-4" />
            <span>Progresiones ({progressions.length})</span>
          </div>
        }
      >
        <ProgressionsTab progressions={progressions} />
      </Tab>
      <Tab
        key="songs"
        title={
          <div className="flex items-center gap-2">
            <Music className="size-4" />
            <span>Canciones ({songs.length})</span>
          </div>
        }
      >
        <SongsTab songs={songs} genres={genres} progressions={progressions} />
      </Tab>
    </Tabs>
  );
}

function GenresTab({ genres }: { genres: Genre[] }) {
  const createModal = useDisclosure();
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Géneros Musicales</h2>
        <Button color="primary" onPress={createModal.onOpen}>
          <Plus className="size-4 mr-2" />
          Nuevo Género
        </Button>
        <Modal isOpen={createModal.isOpen} onOpenChange={createModal.onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <form action={createGenre} onSubmit={() => onClose()}>
                <ModalHeader>Crear Género</ModalHeader>
                <ModalBody className="space-y-4">
                  <Input name="id" label="ID (slug)" placeholder="salsa" isRequired />
                  <Input name="name" label="Nombre" placeholder="Salsa" isRequired />
                  <Input name="label" label="Etiqueta" placeholder="Salsa Clásica" isRequired />
                </ModalBody>
                <ModalFooter>
                  <Button variant="bordered" onPress={onClose}>
                    Cancelar
                  </Button>
                  <Button color="primary" type="submit">
                    Crear
                  </Button>
                </ModalFooter>
              </form>
            )}
          </ModalContent>
        </Modal>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {genres.map((genre) => (
          <GenreCard
            key={genre.id}
            genre={genre}
            onEdit={() => setEditingGenre(genre)}
          />
        ))}
      </div>

      <Modal isOpen={!!editingGenre} onOpenChange={(open) => !open && setEditingGenre(null)}>
        <ModalContent>
          {(onClose) => (
            <form action={updateGenre} onSubmit={() => onClose()}>
              <ModalHeader>Editar Género</ModalHeader>
              <ModalBody className="space-y-4">
                <input type="hidden" name="id" value={editingGenre?.id} />
                <Input
                  name="name"
                  label="Nombre"
                  defaultValue={editingGenre?.name}
                  isRequired
                />
                <Input
                  name="label"
                  label="Etiqueta"
                  defaultValue={editingGenre?.label}
                  isRequired
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="bordered" onPress={onClose}>
                  Cancelar
                </Button>
                <Button color="primary" type="submit">
                  Guardar
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

function GenreCard({ genre, onEdit }: { genre: Genre; onEdit: () => void }) {
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <p className="font-semibold">{genre.name}</p>
        <div className="flex gap-1">
          <Button variant="light" isIconOnly size="sm" onPress={onEdit}>
            <Pencil className="size-4" />
          </Button>
          <form action={deleteGenre}>
            <input type="hidden" name="id" value={genre.id} />
            <Button
              type="submit"
              variant="light"
              isIconOnly
              size="sm"
              className="text-danger"
            >
              <Trash2 className="size-4" />
            </Button>
          </form>
        </div>
      </CardHeader>
      <CardBody>
        <p className="text-sm text-muted-foreground">{genre.label}</p>
        <Chip variant="bordered" size="sm" className="mt-2">
          ID: {genre.id}
        </Chip>
      </CardBody>
    </Card>
  );
}

function ProgressionsTab({ progressions }: { progressions: Progression[] }) {
  const createModal = useDisclosure();
  const [editingProgression, setEditingProgression] = useState<Progression | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Progresiones Armónicas</h2>
        <Button color="primary" onPress={createModal.onOpen}>
          <Plus className="size-4 mr-2" />
          Nueva Progresión
        </Button>
        <Modal isOpen={createModal.isOpen} onOpenChange={createModal.onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <form action={createProgression} onSubmit={() => onClose()}>
                <ModalHeader>Crear Progresión</ModalHeader>
                <ModalBody className="space-y-4">
                  <Input name="name" label="Nombre" placeholder="I-IV-V-I" isRequired />
                  <Input name="numerals" label="Numerales (separados por coma)" placeholder="I, IV, V, I" isRequired />
                  <Input name="description" label="Descripción" placeholder="Progresión clásica..." />
                  <Select name="difficulty" label="Dificultad" defaultSelectedKeys={['beginner']}>
                    {DIFFICULTIES.map((d) => (
                      <SelectItem key={d}>
                        {d === 'beginner' ? 'Principiante' : d === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                      </SelectItem>
                    ))}
                  </Select>
                </ModalBody>
                <ModalFooter>
                  <Button variant="bordered" onPress={onClose}>
                    Cancelar
                  </Button>
                  <Button color="primary" type="submit">
                    Crear
                  </Button>
                </ModalFooter>
              </form>
            )}
          </ModalContent>
        </Modal>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {progressions.map((prog) => (
          <ProgressionCard
            key={prog.id}
            progression={prog}
            onEdit={() => setEditingProgression(prog)}
          />
        ))}
      </div>

      <Modal isOpen={!!editingProgression} onOpenChange={(open) => !open && setEditingProgression(null)}>
        <ModalContent>
          {(onClose) => (
            <form action={updateProgression} onSubmit={() => onClose()}>
              <ModalHeader>Editar Progresión</ModalHeader>
              <ModalBody className="space-y-4">
                <input type="hidden" name="id" value={editingProgression?.id} />
                <Input name="name" label="Nombre" defaultValue={editingProgression?.name} isRequired />
                <Input name="numerals" label="Numerales (separados por coma)" defaultValue={editingProgression?.numerals.join(', ')} isRequired />
                <Input name="description" label="Descripción" defaultValue={editingProgression?.description || ''} />
                <Select name="difficulty" label="Dificultad" defaultSelectedKeys={editingProgression ? [editingProgression.difficulty] : []}>
                  {DIFFICULTIES.map((d) => (
                    <SelectItem key={d}>
                      {d === 'beginner' ? 'Principiante' : d === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                    </SelectItem>
                  ))}
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button variant="bordered" onPress={onClose}>
                  Cancelar
                </Button>
                <Button color="primary" type="submit">
                  Guardar
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

function ProgressionCard({ progression, onEdit }: { progression: Progression; onEdit: () => void }) {
  const difficultyColor = progression.difficulty === 'beginner' ? 'primary' : progression.difficulty === 'intermediate' ? 'secondary' : 'danger';

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <p className="font-semibold">{progression.name}</p>
        <div className="flex gap-1">
          <Button variant="light" isIconOnly size="sm" onPress={onEdit}>
            <Pencil className="size-4" />
          </Button>
          <form action={deleteProgression}>
            <input type="hidden" name="id" value={progression.id} />
            <Button type="submit" variant="light" isIconOnly size="sm" className="text-danger">
              <Trash2 className="size-4" />
            </Button>
          </form>
        </div>
      </CardHeader>
      <CardBody>
        <div className="flex flex-wrap gap-1 mb-2">
          {progression.numerals.map((n, i) => (
            <Chip key={i} size="sm" variant="flat">
              {n}
            </Chip>
          ))}
        </div>
        {progression.description && (
          <p className="text-sm text-muted-foreground mb-2">
            {progression.description}
          </p>
        )}
        <Chip color={difficultyColor} size="sm">
          {progression.difficulty === 'beginner' ? 'Principiante' : progression.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
        </Chip>
      </CardBody>
    </Card>
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
  const createModal = useDisclosure();
  const [editingSong, setEditingSong] = useState<SongWithRelations | null>(null);

  const filteredSongs =
    filterGenre === 'all'
      ? songs
      : songs.filter((s) => s.genreId === filterGenre);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Canciones</h2>
          <Select
            selectedKeys={[filterGenre]}
            onSelectionChange={(keys) => setFilterGenre(Array.from(keys)[0] as string)}
            className="w-40"
            size="sm"
            items={[{ id: 'all', name: 'Todos' }, ...genres]}
          >
            {(item) => <SelectItem key={item.id}>{item.name}</SelectItem>}
          </Select>
        </div>
        <Button color="primary" onPress={createModal.onOpen}>
          <Plus className="size-4 mr-2" />
          Nueva Canción
        </Button>
        <Modal isOpen={createModal.isOpen} onOpenChange={createModal.onOpenChange} size="2xl" scrollBehavior="inside">
          <ModalContent>
            {(onClose) => (
              <form action={createSong} onSubmit={() => onClose()}>
                <ModalHeader>Crear Canción</ModalHeader>
                <ModalBody className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input name="title" label="Título" isRequired />
                    <Input name="artist" label="Artista" isRequired />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Select name="key" label="Tonalidad" defaultSelectedKeys={['C']}>
                      {NOTES.map((n) => (
                        <SelectItem key={n}>{n}</SelectItem>
                      ))}
                    </Select>
                    <Select name="mode" label="Modo" defaultSelectedKeys={['major']}>
                      {MODES.map((m) => (
                        <SelectItem key={m}>{m === 'major' ? 'Mayor' : 'Menor'}</SelectItem>
                      ))}
                    </Select>
                    <Input name="year" label="Año" type="number" placeholder="1975" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Select name="genreId" label="Género" isRequired placeholder="Seleccionar...">
                      {genres.map((g) => (
                        <SelectItem key={g.id}>{g.name}</SelectItem>
                      ))}
                    </Select>
                    <Select name="progressionId" label="Progresión" isRequired placeholder="Seleccionar...">
                      {progressions.map((p) => (
                        <SelectItem key={p.id}>{p.name}</SelectItem>
                      ))}
                    </Select>
                  </div>
                  <Select name="difficulty" label="Dificultad" defaultSelectedKeys={['beginner']}>
                    {DIFFICULTIES.map((d) => (
                      <SelectItem key={d}>
                        {d === 'beginner' ? 'Principiante' : d === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                      </SelectItem>
                    ))}
                  </Select>
                  <Input name="description" label="Descripción" placeholder="Opcional..." />
                  <div className="grid grid-cols-3 gap-4">
                    <Input name="youtubeId" label="YouTube ID" placeholder="dQw4w9WgXcQ" />
                    <Input name="startTime" label="Inicio (segundos)" type="number" placeholder="0" />
                    <Input name="duration" label="Duración (segundos)" type="number" placeholder="30" />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button variant="bordered" onPress={onClose}>
                    Cancelar
                  </Button>
                  <Button color="primary" type="submit">
                    Crear
                  </Button>
                </ModalFooter>
              </form>
            )}
          </ModalContent>
        </Modal>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSongs.map((song) => (
          <SongCard
            key={song.id}
            song={song}
            onEdit={() => setEditingSong(song)}
          />
        ))}
      </div>

      <Modal isOpen={!!editingSong} onOpenChange={(open) => !open && setEditingSong(null)} size="2xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <form action={updateSong} onSubmit={() => onClose()}>
              <ModalHeader>Editar Canción</ModalHeader>
              <ModalBody className="space-y-4">
                <input type="hidden" name="id" value={editingSong?.id} />
                <div className="grid grid-cols-2 gap-4">
                  <Input name="title" label="Título" defaultValue={editingSong?.title} isRequired />
                  <Input name="artist" label="Artista" defaultValue={editingSong?.artist} isRequired />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Select name="key" label="Tonalidad" defaultSelectedKeys={editingSong ? [editingSong.key] : []}>
                    {NOTES.map((n) => (
                      <SelectItem key={n}>{n}</SelectItem>
                    ))}
                  </Select>
                  <Select name="mode" label="Modo" defaultSelectedKeys={editingSong ? [editingSong.mode] : []}>
                    {MODES.map((m) => (
                      <SelectItem key={m}>{m === 'major' ? 'Mayor' : 'Menor'}</SelectItem>
                    ))}
                  </Select>
                  <Input name="year" label="Año" type="number" defaultValue={editingSong?.year?.toString() || ''} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Select name="genreId" label="Género" defaultSelectedKeys={editingSong ? [editingSong.genreId] : []}>
                    {genres.map((g) => (
                      <SelectItem key={g.id}>{g.name}</SelectItem>
                    ))}
                  </Select>
                  <Select name="progressionId" label="Progresión" defaultSelectedKeys={editingSong ? [editingSong.progressionId] : []}>
                    {progressions.map((p) => (
                      <SelectItem key={p.id}>{p.name}</SelectItem>
                    ))}
                  </Select>
                </div>
                <Select name="difficulty" label="Dificultad" defaultSelectedKeys={editingSong ? [editingSong.difficulty] : []}>
                  {DIFFICULTIES.map((d) => (
                    <SelectItem key={d}>
                      {d === 'beginner' ? 'Principiante' : d === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                    </SelectItem>
                  ))}
                </Select>
                <Input name="description" label="Descripción" defaultValue={editingSong?.description || ''} />
                <div className="grid grid-cols-3 gap-4">
                  <Input name="youtubeId" label="YouTube ID" defaultValue={editingSong?.youtubeId || ''} />
                  <Input name="startTime" label="Inicio (seg)" type="number" defaultValue={editingSong?.startTime?.toString() || ''} />
                  <Input name="duration" label="Duración (seg)" type="number" defaultValue={editingSong?.duration?.toString() || ''} />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="bordered" onPress={onClose}>
                  Cancelar
                </Button>
                <Button color="primary" type="submit">
                  Guardar
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

function SongCard({ song, onEdit }: { song: SongWithRelations; onEdit: () => void }) {
  const difficultyColor = song.difficulty === 'beginner' ? 'primary' : song.difficulty === 'intermediate' ? 'secondary' : 'danger';

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <div>
          <p className="font-semibold">{song.title}</p>
          <p className="text-sm text-muted-foreground">{song.artist}</p>
        </div>
        <div className="flex gap-1">
          <Button variant="light" isIconOnly size="sm" onPress={onEdit}>
            <Pencil className="size-4" />
          </Button>
          <form action={deleteSong}>
            <input type="hidden" name="id" value={song.id} />
            <input type="hidden" name="genreId" value={song.genreId} />
            <Button type="submit" variant="light" isIconOnly size="sm" className="text-danger">
              <Trash2 className="size-4" />
            </Button>
          </form>
        </div>
      </CardHeader>
      <CardBody className="space-y-2">
        <div className="flex flex-wrap gap-1">
          <Chip size="sm" color="primary">{song.genre.name}</Chip>
          <Chip size="sm" variant="bordered">
            {song.key} {song.mode === 'major' ? 'Mayor' : 'menor'}
          </Chip>
          {song.year && <Chip size="sm" variant="flat">{song.year}</Chip>}
        </div>
        <div className="text-sm text-muted-foreground">
          Progresión: {song.progression.name}
        </div>
        <Chip color={difficultyColor} size="sm">
          {song.difficulty === 'beginner' ? 'Principiante' : song.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
        </Chip>
      </CardBody>
    </Card>
  );
}
