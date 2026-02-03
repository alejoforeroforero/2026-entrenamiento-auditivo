import {
  getUserFavorites,
  getUserFavoriteIds,
  addFavorite,
  removeFavorite,
  isFavorite,
} from '../favorites';

// Mock Prisma
const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();
const mockCreate = jest.fn();
const mockDelete = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    favorite: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      delete: (...args: unknown[]) => mockDelete(...args),
    },
  },
}));

const mockSong = {
  id: 's1',
  title: 'Quimbara',
  artist: 'Celia Cruz',
  genreId: 'salsa',
  genre: { id: 'salsa', name: 'salsa', label: 'Salsa' },
  progression: { id: 'p1', name: 'I-IV-V-I', numerals: ['I', 'IV', 'V', 'I'] },
};

describe('favorites queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserFavorites', () => {
    it('should return user favorite songs', async () => {
      const mockFavorites = [
        { id: 'f1', userId: 'user1', songId: 's1', song: mockSong },
        { id: 'f2', userId: 'user1', songId: 's2', song: { ...mockSong, id: 's2', title: 'Song 2' } },
      ];
      mockFindMany.mockResolvedValue(mockFavorites);

      const result = await getUserFavorites('user1');

      expect(mockFindMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        include: {
          song: {
            include: {
              genre: true,
              progression: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockSong);
    });

    it('should return empty array when user has no favorites', async () => {
      mockFindMany.mockResolvedValue([]);

      const result = await getUserFavorites('user1');

      expect(result).toEqual([]);
    });
  });

  describe('getUserFavoriteIds', () => {
    it('should return Set of song ids', async () => {
      const mockFavorites = [
        { songId: 's1' },
        { songId: 's2' },
        { songId: 's3' },
      ];
      mockFindMany.mockResolvedValue(mockFavorites);

      const result = await getUserFavoriteIds('user1');

      expect(mockFindMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        select: { songId: true },
      });
      expect(result).toBeInstanceOf(Set);
      expect(result.has('s1')).toBe(true);
      expect(result.has('s2')).toBe(true);
      expect(result.has('s3')).toBe(true);
      expect(result.size).toBe(3);
    });

    it('should return empty Set when no favorites', async () => {
      mockFindMany.mockResolvedValue([]);

      const result = await getUserFavoriteIds('user1');

      expect(result.size).toBe(0);
    });
  });

  describe('addFavorite', () => {
    it('should create a new favorite', async () => {
      const newFavorite = { id: 'f1', userId: 'user1', songId: 's1' };
      mockCreate.mockResolvedValue(newFavorite);

      const result = await addFavorite('user1', 's1');

      expect(mockCreate).toHaveBeenCalledWith({
        data: { userId: 'user1', songId: 's1' },
      });
      expect(result).toEqual(newFavorite);
    });
  });

  describe('removeFavorite', () => {
    it('should delete a favorite', async () => {
      const deletedFavorite = { id: 'f1', userId: 'user1', songId: 's1' };
      mockDelete.mockResolvedValue(deletedFavorite);

      const result = await removeFavorite('user1', 's1');

      expect(mockDelete).toHaveBeenCalledWith({
        where: {
          userId_songId: { userId: 'user1', songId: 's1' },
        },
      });
      expect(result).toEqual(deletedFavorite);
    });
  });

  describe('isFavorite', () => {
    it('should return true when song is favorited', async () => {
      mockFindUnique.mockResolvedValue({ id: 'f1', userId: 'user1', songId: 's1' });

      const result = await isFavorite('user1', 's1');

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: {
          userId_songId: { userId: 'user1', songId: 's1' },
        },
      });
      expect(result).toBe(true);
    });

    it('should return false when song is not favorited', async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await isFavorite('user1', 's1');

      expect(result).toBe(false);
    });
  });
});
