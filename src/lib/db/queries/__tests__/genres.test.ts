import { getGenres, getGenreById, getGenreWithStats } from '../genres';

// Mock Prisma
const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();
const mockCount = jest.fn();

jest.mock('../../index', () => ({
  prisma: {
    genre: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
    progression: {
      count: (...args: unknown[]) => mockCount(...args),
    },
  },
}));

const mockGenre = {
  id: 'salsa',
  name: 'salsa',
  label: 'Salsa',
  description: 'Cuban-origin dance music',
};

describe('genres queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGenres', () => {
    it('should return all genres ordered by name', async () => {
      const mockGenres = [
        { ...mockGenre },
        { id: 'cumbia', name: 'cumbia', label: 'Cumbia' },
      ];
      mockFindMany.mockResolvedValue(mockGenres);

      const result = await getGenres();

      expect(mockFindMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(mockGenres);
    });

    it('should return empty array when no genres exist', async () => {
      mockFindMany.mockResolvedValue([]);

      const result = await getGenres();

      expect(result).toEqual([]);
    });
  });

  describe('getGenreById', () => {
    it('should return genre by id', async () => {
      mockFindUnique.mockResolvedValue(mockGenre);

      const result = await getGenreById('salsa');

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 'salsa' },
      });
      expect(result).toEqual(mockGenre);
    });

    it('should return null when genre not found', async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await getGenreById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getGenreWithStats', () => {
    it('should return genre with song and progression counts', async () => {
      const genreWithCount = {
        ...mockGenre,
        _count: { songs: 15 },
      };
      mockFindUnique.mockResolvedValue(genreWithCount);
      mockCount.mockResolvedValue(8);

      const result = await getGenreWithStats('salsa');

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 'salsa' },
        include: {
          _count: {
            select: { songs: true },
          },
        },
      });
      expect(mockCount).toHaveBeenCalledWith({
        where: {
          songs: {
            some: { genreId: 'salsa' },
          },
        },
      });
      expect(result).toEqual({
        ...genreWithCount,
        songCount: 15,
        progressionCount: 8,
      });
    });

    it('should return null when genre not found', async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await getGenreWithStats('nonexistent');

      expect(result).toBeNull();
      expect(mockCount).not.toHaveBeenCalled();
    });

    it('should handle genre with zero songs', async () => {
      const genreWithZero = {
        ...mockGenre,
        _count: { songs: 0 },
      };
      mockFindUnique.mockResolvedValue(genreWithZero);
      mockCount.mockResolvedValue(0);

      const result = await getGenreWithStats('salsa');

      expect(result).toEqual({
        ...genreWithZero,
        songCount: 0,
        progressionCount: 0,
      });
    });
  });
});
