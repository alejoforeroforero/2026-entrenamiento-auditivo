'use client';

import { useState, useMemo, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProgressionStore } from '@/stores/progression-store';
import { useGenreStore } from '@/stores/genre-store';
import { NoteName, RomanNumeral } from '@/types/music';
import { RepertoireEntry } from '@/types/admin';

const STORAGE_KEY = 'ea-repertoire';

const keys: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const difficulties = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
];

const romanNumerals: RomanNumeral[] = ['I', 'i', 'II', 'ii', 'III', 'iii', 'IV', 'iv', 'V', 'v', 'VI', 'vi', 'VII', 'vii', 'viio'];

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function loadFromStorage(): RepertoireEntry[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveToStorage(entries: RepertoireEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export default function AdminPage() {
  // Stores
  const { progressions, addProgression, deleteProgression } = useProgressionStore();
  const { genres, addGenre, deleteGenre } = useGenreStore();

  // Genre form state
  const [genreLabel, setGenreLabel] = useState('');

  // Song form state
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: '',
    progressionId: '',
    key: '' as NoteName | '',
    mode: '' as 'major' | 'minor' | '',
    youtubeUrl: '',
    difficulty: '' as 'beginner' | 'intermediate' | 'advanced' | '',
    year: '',
    description: '',
    startTime: '',
    duration: '',
  });

  // Progression form state
  const [progressionForm, setProgressionForm] = useState({
    numerals: [] as RomanNumeral[],
    description: '',
  });

  const [savedEntries, setSavedEntries] = useState<RepertoireEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [metadataSuggestions, setMetadataSuggestions] = useState<{
    chordifyUrl: string;
    startTime: number;
    duration: number;
  } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    setSavedEntries(loadFromStorage());
    setIsLoaded(true);
  }, []);

  // Save to localStorage when entries change
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(savedEntries);
    }
  }, [savedEntries, isLoaded]);

  const youtubeId = useMemo(() => {
    return extractYoutubeId(formData.youtubeUrl);
  }, [formData.youtubeUrl]);

  // All progressions are available for all genres
  const filteredProgressions = progressions;

  const selectedProgression = useMemo(() => {
    return progressions.find((p) => p.id === formData.progressionId);
  }, [formData.progressionId, progressions]);

  // Fetch YouTube metadata
  const fetchYoutubeMetadata = async () => {
    if (!youtubeId) {
      alert('Por favor ingresa una URL de YouTube válida');
      return;
    }

    setIsLoadingMetadata(true);
    setMetadataSuggestions(null);

    try {
      // Using noembed.com as a CORS-friendly oEmbed proxy
      const response = await fetch(
        `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${youtubeId}`
      );
      const data = await response.json();

      if (data.error) {
        alert('No se pudo obtener la metadata del video');
        return;
      }

      // Parse title - often in format "Artist - Song" or "Song - Artist"
      const title = data.title || '';
      const author = data.author_name || '';

      // Try to extract artist and song from title
      let songTitle = title;
      let artist = author;

      // Common patterns: "Artist - Song", "Song - Artist", "Song | Artist"
      const separators = [' - ', ' – ', ' | ', ' // '];
      for (const sep of separators) {
        if (title.includes(sep)) {
          const parts = title.split(sep);
          if (parts.length >= 2) {
            // Usually first part is artist, second is song
            artist = parts[0].trim();
            songTitle = parts.slice(1).join(sep).trim();
            break;
          }
        }
      }

      // Clean up common suffixes
      songTitle = songTitle
        .replace(/\s*\(Official.*?\)/gi, '')
        .replace(/\s*\[Official.*?\]/gi, '')
        .replace(/\s*\(Audio.*?\)/gi, '')
        .replace(/\s*\[Audio.*?\]/gi, '')
        .replace(/\s*\(Video.*?\)/gi, '')
        .replace(/\s*\[Video.*?\]/gi, '')
        .replace(/\s*\(Lyric.*?\)/gi, '')
        .replace(/\s*\[Lyric.*?\]/gi, '')
        .trim();

      setFormData((prev) => ({
        ...prev,
        title: songTitle || title,
        artist: artist,
      }));

      // Generate Chordify URL for the specific YouTube video
      const chordifyUrl = `https://chordify.net/chords/songs/${youtubeId}`;

      // Set suggestions (without chord scraping since Chordify blocks it)
      setMetadataSuggestions({
        chordifyUrl,
        startTime: 10,
        duration: 15,
      });

      console.log('Metadata obtenida:', { title: songTitle, artist, original: data });
    } catch (error) {
      console.error('Error fetching metadata:', error);
      alert('Error al obtener la metadata');
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  // Genre handlers
  const handleGenreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genreLabel.trim()) {
      alert('Por favor ingresa un nombre para el género');
      return;
    }

    const result = addGenre(genreLabel.trim(), genreLabel.trim());
    if (!result) {
      alert('Ya existe un género con ese nombre');
      return;
    }

    setGenreLabel('');
  };

  const handleDeleteGenre = (id: string) => {
    // Check if any song uses this genre
    const songsUsingGenre = savedEntries.filter((e) => e.genre === id);
    if (songsUsingGenre.length > 0) {
      alert(`No se puede eliminar. Hay ${songsUsingGenre.length} canción(es) usando este género.`);
      return;
    }
    if (confirm('¿Eliminar este género?')) {
      deleteGenre(id);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.artist || !formData.genre || !formData.progressionId || !formData.key || !formData.mode || !youtubeId || !formData.difficulty) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const entry: RepertoireEntry = {
      id: `${formData.genre}-${Date.now()}`,
      title: formData.title,
      artist: formData.artist,
      genre: formData.genre as RepertoireEntry['genre'],
      progressionId: formData.progressionId,
      progression: selectedProgression!.numerals,
      key: formData.key as NoteName,
      mode: formData.mode as 'major' | 'minor',
      youtubeId: youtubeId,
      youtubeUrl: formData.youtubeUrl,
      difficulty: formData.difficulty as 'beginner' | 'intermediate' | 'advanced',
      year: formData.year ? parseInt(formData.year) : undefined,
      description: formData.description || undefined,
      startTime: formData.startTime ? parseFloat(formData.startTime) : undefined,
      duration: formData.duration ? parseFloat(formData.duration) : undefined,
      createdAt: Date.now(),
    };

    setSavedEntries((prev) => [...prev, entry]);

    // Reset form
    setFormData({
      title: '',
      artist: '',
      genre: '',
      progressionId: '',
      key: '' as NoteName | '',
      mode: '' as 'major' | 'minor' | '',
      youtubeUrl: '',
      difficulty: '' as 'beginner' | 'intermediate' | 'advanced' | '',
      year: '',
      description: '',
      startTime: '',
      duration: '',
    });
  };

  const copyToClipboard = () => {
    const json = JSON.stringify(savedEntries, null, 2);
    navigator.clipboard.writeText(json);
    alert('JSON copiado al portapapeles');
  };

  const deleteEntry = (id: string) => {
    if (confirm('¿Eliminar esta canción?')) {
      setSavedEntries((prev) => prev.filter((e) => e.id !== id));
    }
  };

  // Progression form handlers
  const handleProgressionChange = (field: string, value: string) => {
    setProgressionForm((prev) => ({ ...prev, [field]: value }));
  };

  const addNumeralToProgression = (numeral: RomanNumeral) => {
    setProgressionForm((prev) => ({
      ...prev,
      numerals: [...prev.numerals, numeral],
    }));
  };

  const removeLastNumeral = () => {
    setProgressionForm((prev) => ({
      ...prev,
      numerals: prev.numerals.slice(0, -1),
    }));
  };

  const clearNumerals = () => {
    setProgressionForm((prev) => ({
      ...prev,
      numerals: [],
    }));
  };

  const handleProgressionSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (progressionForm.numerals.length === 0) {
      alert('Por favor selecciona al menos un acorde');
      return;
    }

    // Generate name from numerals
    const generatedName = progressionForm.numerals.join('-');

    // Check for duplicates (same numerals)
    const isDuplicate = progressions.some(
      (p) => p.numerals.join('-') === generatedName
    );

    if (isDuplicate) {
      alert(`Ya existe una progresión ${generatedName}`);
      return;
    }

    addProgression({
      name: generatedName,
      numerals: progressionForm.numerals,
      description: progressionForm.description || undefined,
    });

    // Reset form
    setProgressionForm({
      numerals: [],
      description: '',
    });
  };

  const handleDeleteProgression = (id: string) => {
    // Check if any song uses this progression
    const songsUsingProgression = savedEntries.filter((e) => e.progressionId === id);
    if (songsUsingProgression.length > 0) {
      alert(`No se puede eliminar. Hay ${songsUsingProgression.length} canción(es) usando esta progresión.`);
      return;
    }
    if (confirm('¿Eliminar esta progresión?')) {
      deleteProgression(id);
    }
  };

  const copyProgressionsToClipboard = () => {
    const json = JSON.stringify(progressions, null, 2);
    navigator.clipboard.writeText(json);
    alert('JSON copiado al portapapeles');
  };

  const copyGenresToClipboard = () => {
    const json = JSON.stringify(genres, null, 2);
    navigator.clipboard.writeText(json);
    alert('JSON copiado al portapapeles');
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Admin - Repertorio</h1>

      <Tabs defaultValue="genres" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="genres">Géneros</TabsTrigger>
          <TabsTrigger value="progressions">Progresiones</TabsTrigger>
          <TabsTrigger value="songs">Canciones</TabsTrigger>
        </TabsList>

        {/* Genres Tab */}
        <TabsContent value="genres">
          <div className="grid gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Agregar género</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenreSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre del género *</label>
                    <Input
                      placeholder="Ej: Cumbia, Salsa, Vallenato..."
                      value={genreLabel}
                      onChange={(e) => setGenreLabel(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Agregar género
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Géneros guardados ({genres.length})</span>
                  {genres.length > 0 && (
                    <Button variant="outline" size="sm" onClick={copyGenresToClipboard}>
                      Copiar JSON
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {genres.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Los géneros agregados aparecerán aquí
                  </p>
                ) : (
                  <div className="space-y-2">
                    {genres.map((genre) => (
                      <div
                        key={genre.id}
                        className="p-3 rounded-lg border bg-muted/50 flex items-center justify-between"
                      >
                        <span className="font-medium">{genre.label}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-100"
                          onClick={() => handleDeleteGenre(genre.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Progressions Tab */}
        <TabsContent value="progressions">
          <div className="grid gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Agregar progresión armónica</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProgressionSubmit} className="space-y-4">
                  {/* Roman Numerals */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Acordes (numeración romana) *</label>

                    {/* Current selection display */}
                    <div className="p-3 bg-muted rounded-lg min-h-12 flex items-center gap-2 flex-wrap">
                      {progressionForm.numerals.length === 0 ? (
                        <span className="text-muted-foreground text-sm">Selecciona los acordes...</span>
                      ) : (
                        progressionForm.numerals.map((numeral, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm font-medium"
                          >
                            {numeral}
                          </span>
                        ))
                      )}
                    </div>

                    {/* Numeral buttons */}
                    <div className="flex flex-wrap gap-1">
                      {romanNumerals.map((numeral) => (
                        <Button
                          key={numeral}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addNumeralToProgression(numeral)}
                        >
                          {numeral}
                        </Button>
                      ))}
                    </div>

                    {/* Control buttons */}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={removeLastNumeral}
                        disabled={progressionForm.numerals.length === 0}
                      >
                        Borrar último
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={clearNumerals}
                        disabled={progressionForm.numerals.length === 0}
                      >
                        Limpiar todo
                      </Button>
                    </div>

                    {/* Generated name preview */}
                    {progressionForm.numerals.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Nombre: <span className="font-medium text-foreground">{progressionForm.numerals.join('-')}</span>
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descripción (opcional)</label>
                    <Input
                      placeholder="Breve descripción de la progresión"
                      value={progressionForm.description}
                      onChange={(e) => handleProgressionChange('description', e.target.value)}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Agregar progresión
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Saved progressions */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Progresiones guardadas ({progressions.length})</span>
                    {progressions.length > 0 && (
                      <Button variant="outline" size="sm" onClick={copyProgressionsToClipboard}>
                        Copiar JSON
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {progressions.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      Las progresiones agregadas aparecerán aquí
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {progressions.map((prog) => (
                        <div
                          key={prog.id}
                          className="p-3 rounded-lg border bg-muted/50 flex items-start justify-between gap-2"
                        >
                          <div>
                            <p className="font-medium">{prog.name}</p>
                            {prog.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {prog.description}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-100 shrink-0"
                            onClick={() => handleDeleteProgression(prog.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {progressions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>JSON</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-80">
                      {JSON.stringify(progressions, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Songs Tab */}
        <TabsContent value="songs">
          <div className="grid gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Agregar canción</CardTitle>
              </CardHeader>
              <CardContent>
                {progressions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Primero debes agregar al menos una progresión armónica
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* YouTube URL */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">URL de YouTube *</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://youtube.com/watch?v=..."
                          value={formData.youtubeUrl}
                          onChange={(e) => handleChange('youtubeUrl', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={fetchYoutubeMetadata}
                          disabled={!youtubeId || isLoadingMetadata}
                        >
                          {isLoadingMetadata ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Traer metadata'
                          )}
                        </Button>
                      </div>
                      {formData.youtubeUrl && !youtubeId && (
                        <p className="text-sm text-red-500">URL no válida</p>
                      )}
                    </div>

                    {/* YouTube Preview */}
                    {youtubeId && (
                      <div className="aspect-video rounded-lg overflow-hidden bg-black">
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${youtubeId}`}
                          title="YouTube video player"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}

                    {/* Metadata Suggestions */}
                    {metadataSuggestions && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800 space-y-3">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Sugerencias
                        </p>

                        {/* Chordify Link */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-muted-foreground">Ver acordes:</span>
                          <a
                            href={metadataSuggestions.chordifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline font-medium"
                          >
                            Abrir en Chordify →
                          </a>
                          <span className="text-xs text-muted-foreground">
                            (tonalidad, acordes y progresión)
                          </span>
                        </div>

                        {/* Time suggestions */}
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="text-sm text-muted-foreground">Fragmento sugerido:</span>
                          <span className="text-sm">
                            Inicio: <strong>{metadataSuggestions.startTime}s</strong>,
                            Duración: <strong>{metadataSuggestions.duration}s</strong>
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                startTime: String(metadataSuggestions.startTime),
                                duration: String(metadataSuggestions.duration),
                              }));
                            }}
                          >
                            Aplicar tiempos
                          </Button>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Tip: Abre Chordify para ver la tonalidad y acordes. Ajusta el inicio donde comienza claramente la progresión.
                        </p>
                      </div>
                    )}

                    {/* Title */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Título *</label>
                      <Input
                        placeholder="Nombre de la canción"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                      />
                    </div>

                    {/* Artist */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Artista *</label>
                      <Input
                        placeholder="Nombre del artista"
                        value={formData.artist}
                        onChange={(e) => handleChange('artist', e.target.value)}
                      />
                    </div>

                    {/* Genre */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Género *</label>
                      <Select
                        value={formData.genre}
                        onValueChange={(v) => handleChange('genre', v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar género" />
                        </SelectTrigger>
                        <SelectContent>
                          {genres.map((g) => (
                            <SelectItem key={g.id} value={g.id}>
                              {g.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Progression */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Progresión armónica *</label>
                      <Select
                        value={formData.progressionId}
                        onValueChange={(v) => handleChange('progressionId', v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar progresión" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredProgressions.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No hay progresiones para este género
                            </SelectItem>
                          ) : (
                            filteredProgressions.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} ({p.numerals.join('-')})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {selectedProgression && (
                        <p className="text-sm text-muted-foreground">
                          {selectedProgression.description}
                        </p>
                      )}
                    </div>

                    {/* Key and Mode */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tonalidad *</label>
                        <Select
                          value={formData.key}
                          onValueChange={(v) => handleChange('key', v)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Tonalidad" />
                          </SelectTrigger>
                          <SelectContent>
                            {keys.map((k) => (
                              <SelectItem key={k} value={k}>
                                {k}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Modo *</label>
                        <Select
                          value={formData.mode}
                          onValueChange={(v) => handleChange('mode', v)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Modo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="major">Mayor</SelectItem>
                            <SelectItem value="minor">Menor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Dificultad *</label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(v) => handleChange('difficulty', v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar dificultad" />
                        </SelectTrigger>
                        <SelectContent>
                          {difficulties.map((d) => (
                            <SelectItem key={d.value} value={d.value}>
                              {d.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Year (optional) */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Año (opcional)</label>
                      <Input
                        type="number"
                        placeholder="1990"
                        value={formData.year}
                        onChange={(e) => handleChange('year', e.target.value)}
                      />
                    </div>

                    {/* Description (optional) */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Descripción (opcional)</label>
                      <Input
                        placeholder="Breve descripción de la canción"
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                      />
                    </div>

                    {/* Start time and Duration */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Inicio (segundos)</label>
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          step="0.1"
                          value={formData.startTime}
                          onChange={(e) => handleChange('startTime', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Segundo donde inicia el fragmento
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Duración (segundos)</label>
                        <Input
                          type="number"
                          placeholder="10"
                          min="1"
                          step="0.1"
                          value={formData.duration}
                          onChange={(e) => handleChange('duration', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Por defecto 10 segundos
                        </p>
                      </div>
                    </div>

                    <Button type="submit" className="w-full">
                      Agregar canción
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Saved entries */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Entradas guardadas ({savedEntries.length})</span>
                    {savedEntries.length > 0 && (
                      <Button variant="outline" size="sm" onClick={copyToClipboard}>
                        Copiar JSON
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {savedEntries.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      Las canciones agregadas aparecerán aquí
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {savedEntries.map((entry) => {
                        const genreLabel = genres.find((g) => g.id === entry.genre)?.label || entry.genre;
                        return (
                          <div
                            key={entry.id}
                            className="p-3 rounded-lg border bg-muted/50 flex items-start justify-between gap-2"
                          >
                            <div>
                              <p className="font-medium">{entry.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {entry.artist} • {genreLabel} • {entry.progression.join('-')}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-100 shrink-0"
                              onClick={() => deleteEntry(entry.id)}
                            >
                              Eliminar
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {savedEntries.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>JSON</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-80">
                      {JSON.stringify(savedEntries, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
