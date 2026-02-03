import {
  getProgressions,
  getProgressionById,
  getProgressionsForGenre,
  getProgressionWithSongs,
} from '../progressions';

// Mock Prisma
const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();

jest.mock('../../index', () => ({
  prisma: {
    progression: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}));

describe('progressions queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProgressions', () => {
    it('should return all progressions ordered by name', async () => {
      const mockProgressions = [
        { id: '1', name: 'I-IV-V-I', numerals: ['I', 'IV', 'V', 'I'] },
        { id: '2', name: 'I-V-vi-IV', numerals: ['I', 'V', 'vi', 'IV'] },
      ];
      mockFindMany.mockResolvedValue(mockProgressions);

      const result = await getProgressions();

      expect(mockFindMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(mockProgressions);
    });

    it('should return empty array when no progressions exist', async () => {
      mockFindMany.mockResolvedValue([]);

      const result = await getProgressions();

      expect(result).toEqual([]);
    });
  });

  describe('getProgressionById', () => {
    it('should return progression by id', async () => {
      const mockProgression = { id: '1', name: 'I-IV-V-I', numerals: ['I', 'IV', 'V', 'I'] };
      mockFindUnique.mockResolvedValue(mockProgression);

      const result = await getProgressionById('1');

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockProgression);
    });

    it('should return null when progression not found', async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await getProgressionById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getProgressionsForGenre', () => {
    it('should return progressions for a genre with song count', async () => {
      const mockProgressions = [
        { id: '1', name: 'I-IV-V-I', numerals: ['I', 'IV', 'V', 'I'], _count: { songs: 5 } },
        { id: '2', name: 'I-V-vi-IV', numerals: ['I', 'V', 'vi', 'IV'], _count: { songs: 3 } },
      ];
      mockFindMany.mockResolvedValue(mockProgressions);

      const result = await getProgressionsForGenre('salsa');

      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          songs: {
            some: { genreId: 'salsa' },
          },
        },
        include: {
          _count: {
            select: { songs: true },
          },
        },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(mockProgressions);
    });

    it('should return empty array when no progressions for genre', async () => {
      mockFindMany.mockResolvedValue([]);

      const result = await getProgressionsForGenre('unknown-genre');

      expect(result).toEqual([]);
    });
  });

  describe('getProgressionWithSongs', () => {
    it('should return progression with songs and genre info', async () => {
      const mockProgression = {
        id: '1',
        name: 'I-IV-V-I',
        numerals: ['I', 'IV', 'V', 'I'],
        songs: [
          { id: 's1', title: 'Song 1', genre: { id: 'salsa', name: 'salsa', label: 'Salsa' } },
          { id: 's2', title: 'Song 2', genre: { id: 'cumbia', name: 'cumbia', label: 'Cumbia' } },
        ],
      };
      mockFindUnique.mockResolvedValue(mockProgression);

      const result = await getProgressionWithSongs('1');

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          songs: {
            include: {
              genre: true,
            },
            orderBy: { title: 'asc' },
          },
        },
      });
      expect(result).toEqual(mockProgression);
    });

    it('should return null when progression not found', async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await getProgressionWithSongs('nonexistent');

      expect(result).toBeNull();
    });
  });
});
