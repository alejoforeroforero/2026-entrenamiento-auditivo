'use client';

import { useState } from 'react';
import { Genre, Progression, Song } from '@prisma/client';
import {
  Tabs,
  Tab,
  Button,
  Input,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  useDisclosure,
} from '@heroui/react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
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
    <Tabs
      variant="underlined"
      classNames={{
        tabList: 'gap-6 border-b border-border',
        tab: 'px-0 h-10 text-muted-foreground data-[selected=true]:text-danger-500',
        cursor: 'bg-danger-500',
        panel: 'pt-6',
      }}
    >
      <Tab key="genres" title="Géneros">
        <GenresTab genres={genres} />
      </Tab>
      <Tab key="progressions" title="Progresiones">
        <ProgressionsTab progressions={progressions} />
      </Tab>
      <Tab key="songs" title="Canciones">
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
      <Button color="danger" radius="full" onPress={createModal.onOpen}>
        <Plus className="size-4" />
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
                <Button variant="bordered" onPress={onClose}>Cancelar</Button>
                <Button color="danger" type="submit">Crear</Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      <Table
        aria-label="Géneros"
        classNames={{
          wrapper: 'bg-card rounded-lg',
          th: 'bg-transparent text-muted-foreground font-medium text-sm',
          td: 'py-4',
        }}
      >
        <TableHeader>
          <TableColumn>ID</TableColumn>
          <TableColumn>Nombre</TableColumn>
          <TableColumn>Etiqueta</TableColumn>
          <TableColumn width={120} align="center">Acciones</TableColumn>
        </TableHeader>
        <TableBody>
          {genres.map((genre) => (
            <TableRow key={genre.id}>
              <TableCell>
                <span className="text-muted-foreground font-mono text-sm">{genre.id}</span>
              </TableCell>
              <TableCell>{genre.name}</TableCell>
              <TableCell>{genre.label}</TableCell>
              <TableCell>
                <div className="flex gap-1 justify-center">
                  <Button variant="light" isIconOnly size="sm" onPress={() => setEditingGenre(genre)}>
                    <Pencil className="size-4" />
                  </Button>
                  <form action={deleteGenre}>
                    <input type="hidden" name="id" value={genre.id} />
                    <Button type="submit" variant="light" isIconOnly size="sm" className="text-danger">
                      <Trash2 className="size-4" />
                    </Button>
                  </form>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal isOpen={!!editingGenre} onOpenChange={(open) => !open && setEditingGenre(null)}>
        <ModalContent>
          {(onClose) => (
            <form action={updateGenre} onSubmit={() => onClose()}>
              <ModalHeader>Editar Género</ModalHeader>
              <ModalBody className="space-y-4">
                <input type="hidden" name="id" value={editingGenre?.id} />
                <Input name="name" label="Nombre" defaultValue={editingGenre?.name} isRequired />
                <Input name="label" label="Etiqueta" defaultValue={editingGenre?.label} isRequired />
              </ModalBody>
              <ModalFooter>
                <Button variant="bordered" onPress={onClose}>Cancelar</Button>
                <Button color="danger" type="submit">Guardar</Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

function ProgressionsTab({ progressions }: { progressions: Progression[] }) {
  const createModal = useDisclosure();
  const [editingProgression, setEditingProgression] = useState<Progression | null>(null);

  return (
    <div className="space-y-4">
      <Button color="danger" radius="full" onPress={createModal.onOpen}>
        <Plus className="size-4" />
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
                <Button variant="bordered" onPress={onClose}>Cancelar</Button>
                <Button color="danger" type="submit">Crear</Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      <Table
        aria-label="Progresiones"
        classNames={{
          wrapper: 'bg-card rounded-lg',
          th: 'bg-transparent text-muted-foreground font-medium text-sm',
          td: 'py-4',
        }}
      >
        <TableHeader>
          <TableColumn>Nombre</TableColumn>
          <TableColumn>Numerales</TableColumn>
          <TableColumn>Descripción</TableColumn>
          <TableColumn>Dificultad</TableColumn>
          <TableColumn width={120} align="center">Acciones</TableColumn>
        </TableHeader>
        <TableBody>
          {progressions.map((prog) => {
            const difficultyColor = prog.difficulty === 'beginner' ? 'primary' : prog.difficulty === 'intermediate' ? 'secondary' : 'danger';
            return (
              <TableRow key={prog.id}>
                <TableCell className="font-medium">{prog.name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {prog.numerals.map((n, i) => (
                      <Chip key={i} size="sm" variant="flat">{n}</Chip>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground text-sm">{prog.description || '—'}</span>
                </TableCell>
                <TableCell>
                  <Chip color={difficultyColor} size="sm">
                    {prog.difficulty === 'beginner' ? 'Principiante' : prog.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 justify-center">
                    <Button variant="light" isIconOnly size="sm" onPress={() => setEditingProgression(prog)}>
                      <Pencil className="size-4" />
                    </Button>
                    <form action={deleteProgression}>
                      <input type="hidden" name="id" value={prog.id} />
                      <Button type="submit" variant="light" isIconOnly size="sm" className="text-danger">
                        <Trash2 className="size-4" />
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

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
                <Button variant="bordered" onPress={onClose}>Cancelar</Button>
                <Button color="danger" type="submit">Guardar</Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
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
  const createModal = useDisclosure();
  const [editingSong, setEditingSong] = useState<SongWithRelations | null>(null);

  const filteredSongs =
    filterGenre === 'all'
      ? songs
      : songs.filter((s) => s.genreId === filterGenre);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button color="danger" radius="full" onPress={createModal.onOpen}>
            <Plus className="size-4" />
            Nueva Canción
          </Button>
          <Select
            selectedKeys={[filterGenre]}
            onSelectionChange={(keys) => setFilterGenre(Array.from(keys)[0] as string)}
            className="w-44"
            size="sm"
            items={[{ id: 'all', name: 'Todos' }, ...genres]}
          >
            {(item) => <SelectItem key={item.id}>{item.name}</SelectItem>}
          </Select>
        </div>
        <span className="text-sm text-muted-foreground">{filteredSongs.length} canciones</span>
      </div>

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
                <Button variant="bordered" onPress={onClose}>Cancelar</Button>
                <Button color="danger" type="submit">Crear</Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      <Table
        aria-label="Canciones"
        classNames={{
          wrapper: 'bg-card rounded-lg',
          th: 'bg-transparent text-muted-foreground font-medium text-sm',
          td: 'py-4',
        }}
      >
        <TableHeader>
          <TableColumn>Título</TableColumn>
          <TableColumn>Artista</TableColumn>
          <TableColumn>Género</TableColumn>
          <TableColumn>Progresión</TableColumn>
          <TableColumn>Año</TableColumn>
          <TableColumn width={120} align="center">Acciones</TableColumn>
        </TableHeader>
        <TableBody>
          {filteredSongs.map((song) => (
            <TableRow key={song.id}>
              <TableCell className="font-medium">{song.title}</TableCell>
              <TableCell>{song.artist}</TableCell>
              <TableCell>{song.genre.name}</TableCell>
              <TableCell>
                <span className="text-muted-foreground text-sm">{song.progression.name}</span>
              </TableCell>
              <TableCell>{song.year || '—'}</TableCell>
              <TableCell>
                <div className="flex gap-1 justify-center">
                  <Button variant="light" isIconOnly size="sm" onPress={() => setEditingSong(song)}>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
                <Button variant="bordered" onPress={onClose}>Cancelar</Button>
                <Button color="danger" type="submit">Guardar</Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
