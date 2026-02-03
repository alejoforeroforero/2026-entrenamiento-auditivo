import {
  getSongs,
  getSongById,
  getSongsByGenre,
  getSongsByProgression,
  getRandomSongByGenre,
  getRandomSong,
} from '../songs';

// Mock Prisma
const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();

jest.mock('../../index', () => ({
  prisma: {
    song: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}));

const mockSong = {
  id: 's1',
  title: 'Quimbara',
  artist: 'Celia Cruz',
  genreId: 'salsa',
  progressionId: 'p1',
  key: 'C',
  mode: 'major',
  difficulty: 'beginner',
  genre: { id: 'salsa', name: 'salsa', label: 'Salsa' },
  progression: { id: 'p1', name: 'I-IV-V-I', numerals: ['I', 'IV', 'V', 'I'] },
};

describe('songs queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSongs', () => {
    it('should return all songs with genre and progression', async () => {
      const mockSongs = [mockSong];
      mockFindMany.mockResolvedValue(mockSongs);

      const result = await getSongs();

      expect(mockFindMany).toHaveBeenCalledWith({
        include: {
          genre: true,
          progression: true,
        },
        orderBy: { title: 'asc' },
      });
      expect(result).toEqual(mockSongs);
    });

    it('should return empty array when no songs exist', async () => {
      mockFindMany.mockResolvedValue([]);

      const result = await getSongs();

      expect(result).toEqual([]);
    });
  });

  describe('getSongById', () => {
    it('should return song with genre and progression', async () => {
      mockFindUnique.mockResolvedValue(mockSong);

      const result = await getSongById('s1');

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 's1' },
        include: {
          genre: true,
          progression: true,
        },
      });
      expect(result).toEqual(mockSong);
    });

    it('should return null when song not found', async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await getSongById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getSongsByGenre', () => {
    it('should return songs for a genre with progression', async () => {
      const mockSongs = [mockSong];
      mockFindMany.mockResolvedValue(mockSongs);

      const result = await getSongsByGenre('salsa');

      expect(mockFindMany).toHaveBeenCalledWith({
        where: { genreId: 'salsa' },
        include: {
          progression: true,
        },
        orderBy: { title: 'asc' },
      });
      expect(result).toEqual(mockSongs);
    });

    it('should return empty array when no songs for genre', async () => {
      mockFindMany.mockResolvedValue([]);

      const result = await getSongsByGenre('unknown');

      expect(result).toEqual([]);
    });
  });

  describe('getSongsByProgression', () => {
    it('should return songs for a progression with genre', async () => {
      const mockSongs = [mockSong];
      mockFindMany.mockResolvedValue(mockSongs);

      const result = await getSongsByProgression('p1');

      expect(mockFindMany).toHaveBeenCalledWith({
        where: { progressionId: 'p1' },
        include: {
          genre: true,
        },
        orderBy: { title: 'asc' },
      });
      expect(result).toEqual(mockSongs);
    });

    it('should return empty array when no songs for progression', async () => {
      mockFindMany.mockResolvedValue([]);

      const result = await getSongsByProgression('nonexistent');

      expect(result).toEqual([]);
    });
  });

  describe('getRandomSongByGenre', () => {
    it('should return a random song from the genre', async () => {
      const mockSongs = [
        { ...mockSong, id: 's1' },
        { ...mockSong, id: 's2' },
        { ...mockSong, id: 's3' },
      ];
      mockFindMany.mockResolvedValue(mockSongs);

      const result = await getRandomSongByGenre('salsa');

      expect(mockFindMany).toHaveBeenCalledWith({
        where: { genreId: 'salsa' },
        include: {
          progression: true,
        },
      });
      expect(mockSongs.map((s) => s.id)).toContain(result?.id);
    });

    it('should return null when no songs for genre', async () => {
      mockFindMany.mockResolvedValue([]);

      const result = await getRandomSongByGenre('unknown');

      expect(result).toBeNull();
    });
  });

  describe('getRandomSong', () => {
    it('should return a random song', async () => {
      const mockSongs = [
        { ...mockSong, id: 's1' },
        { ...mockSong, id: 's2' },
      ];
      mockFindMany.mockResolvedValue(mockSongs);

      const result = await getRandomSong();

      expect(mockFindMany).toHaveBeenCalledWith({
        include: {
          genre: true,
          progression: true,
        },
      });
      expect(mockSongs.map((s) => s.id)).toContain(result?.id);
    });

    it('should return null when no songs exist', async () => {
      mockFindMany.mockResolvedValue([]);

      const result = await getRandomSong();

      expect(result).toBeNull();
    });
  });
});
