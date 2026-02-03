import {
  createQuizSession,
  getProgressionsForQuiz,
  getSongsForQuiz,
  createQuizQuestions,
  saveQuestionResult,
  completeQuizSession,
  getUserQuizSessions,
  getUserQuizStats,
  getQuizSession,
} from '../quiz';

// Mock Prisma
const mockSessionCreate = jest.fn();
const mockSessionFindMany = jest.fn();
const mockSessionFindUnique = jest.fn();
const mockSessionUpdate = jest.fn();
const mockSongFindMany = jest.fn();
const mockQuestionCreate = jest.fn();
const mockQuestionFindMany = jest.fn();
const mockQuestionUpdate = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    quizSession: {
      create: (...args: unknown[]) => mockSessionCreate(...args),
      findMany: (...args: unknown[]) => mockSessionFindMany(...args),
      findUnique: (...args: unknown[]) => mockSessionFindUnique(...args),
      update: (...args: unknown[]) => mockSessionUpdate(...args),
    },
    song: {
      findMany: (...args: unknown[]) => mockSongFindMany(...args),
    },
    quizQuestion: {
      create: (...args: unknown[]) => mockQuestionCreate(...args),
      findMany: (...args: unknown[]) => mockQuestionFindMany(...args),
      update: (...args: unknown[]) => mockQuestionUpdate(...args),
    },
  },
}));

const mockProgression = {
  id: 'p1',
  name: 'I-IV-V-I',
  numerals: ['I', 'IV', 'V', 'I'],
};

const mockSong = {
  id: 's1',
  title: 'Quimbara',
  artist: 'Celia Cruz',
  key: 'C',
  mode: 'major',
  youtubeId: 'abc123',
  startTime: 0,
  duration: 30,
  progression: mockProgression,
};

const mockGenre = {
  id: 'salsa',
  name: 'salsa',
  label: 'Salsa',
};

describe('quiz queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createQuizSession', () => {
    it('should create a new quiz session', async () => {
      mockSessionCreate.mockResolvedValue({ id: 'session-1' });

      const result = await createQuizSession('user1', 'salsa', 'piano');

      expect(mockSessionCreate).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          genreId: 'salsa',
          mode: 'piano',
          totalQuestions: 10,
        },
      });
      expect(result).toBe('session-1');
    });

    it('should handle repertoire mode', async () => {
      mockSessionCreate.mockResolvedValue({ id: 'session-2' });

      const result = await createQuizSession('user1', 'cumbia', 'repertoire');

      expect(mockSessionCreate).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          genreId: 'cumbia',
          mode: 'repertoire',
          totalQuestions: 10,
        },
      });
      expect(result).toBe('session-2');
    });
  });

  describe('getProgressionsForQuiz', () => {
    it('should return unique progressions for a genre', async () => {
      const mockSongs = [
        { progression: { ...mockProgression, id: 'p1' } },
        { progression: { ...mockProgression, id: 'p2', name: 'I-V-vi-IV' } },
        { progression: { ...mockProgression, id: 'p1' } }, // duplicate
      ];
      mockSongFindMany.mockResolvedValue(mockSongs);

      const result = await getProgressionsForQuiz('salsa', 10);

      expect(mockSongFindMany).toHaveBeenCalledWith({
        where: { genreId: 'salsa' },
        include: { progression: true },
        distinct: ['progressionId'],
      });
      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should respect limit parameter', async () => {
      const mockSongs = Array.from({ length: 20 }, (_, i) => ({
        progression: { id: `p${i}`, name: `Prog ${i}`, numerals: ['I'] },
      }));
      mockSongFindMany.mockResolvedValue(mockSongs);

      const result = await getProgressionsForQuiz('salsa', 5);

      expect(result.length).toBeLessThanOrEqual(5);
    });

    it('should use default limit of 10', async () => {
      const mockSongs = Array.from({ length: 20 }, (_, i) => ({
        progression: { id: `p${i}`, name: `Prog ${i}`, numerals: ['I'] },
      }));
      mockSongFindMany.mockResolvedValue(mockSongs);

      const result = await getProgressionsForQuiz('salsa');

      expect(result.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getSongsForQuiz', () => {
    it('should return songs with youtube ids', async () => {
      const mockSongs = [mockSong, { ...mockSong, id: 's2' }];
      mockSongFindMany.mockResolvedValue(mockSongs);

      const result = await getSongsForQuiz('salsa', 10);

      expect(mockSongFindMany).toHaveBeenCalledWith({
        where: {
          genreId: 'salsa',
          youtubeId: { not: null },
        },
        include: { progression: true },
        take: 50,
      });
      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should use default limit of 10', async () => {
      mockSongFindMany.mockResolvedValue([mockSong]);

      await getSongsForQuiz('salsa');

      expect(mockSongFindMany).toHaveBeenCalled();
    });
  });

  describe('createQuizQuestions', () => {
    it('should create questions and return them with relations', async () => {
      const questions = [
        { questionNumber: 1, progressionId: 'p1', correctAnswer: ['I', 'IV', 'V', 'I'] },
        { questionNumber: 2, songId: 's1', correctAnswer: ['I', 'V', 'vi', 'IV'] },
      ];
      const createdQuestions = questions.map((q, i) => ({
        id: `q${i + 1}`,
        sessionId: 'session-1',
        ...q,
        progression: mockProgression,
        song: mockSong,
      }));
      mockQuestionCreate.mockResolvedValue({});
      mockQuestionFindMany.mockResolvedValue(createdQuestions);

      const result = await createQuizQuestions('session-1', questions);

      expect(mockQuestionCreate).toHaveBeenCalledTimes(2);
      expect(mockQuestionFindMany).toHaveBeenCalledWith({
        where: { sessionId: 'session-1' },
        orderBy: { questionNumber: 'asc' },
        include: {
          progression: true,
          song: true,
        },
      });
      expect(result).toEqual(createdQuestions);
    });
  });

  describe('saveQuestionResult', () => {
    it('should update question with result', async () => {
      const updatedQuestion = {
        id: 'q1',
        userAnswer: ['I', 'IV', 'V', 'I'],
        isCorrect: true,
        attemptsUsed: 1,
      };
      mockQuestionUpdate.mockResolvedValue(updatedQuestion);

      const result = await saveQuestionResult('q1', ['I', 'IV', 'V', 'I'], true, 1);

      expect(mockQuestionUpdate).toHaveBeenCalledWith({
        where: { id: 'q1' },
        data: {
          userAnswer: ['I', 'IV', 'V', 'I'],
          isCorrect: true,
          attemptsUsed: 1,
        },
      });
      expect(result).toEqual(updatedQuestion);
    });

    it('should handle incorrect answers', async () => {
      mockQuestionUpdate.mockResolvedValue({ isCorrect: false, attemptsUsed: 3 });

      await saveQuestionResult('q1', ['wrong'], false, 3);

      expect(mockQuestionUpdate).toHaveBeenCalledWith({
        where: { id: 'q1' },
        data: {
          userAnswer: ['wrong'],
          isCorrect: false,
          attemptsUsed: 3,
        },
      });
    });
  });

  describe('completeQuizSession', () => {
    it('should update session with completion data', async () => {
      const mockQuestions = [
        { isCorrect: true },
        { isCorrect: true },
        { isCorrect: false },
      ];
      mockQuestionFindMany.mockResolvedValue(mockQuestions);
      mockSessionUpdate.mockResolvedValue({ id: 'session-1', correctAnswers: 2 });

      const result = await completeQuizSession('session-1');

      expect(mockQuestionFindMany).toHaveBeenCalledWith({
        where: { sessionId: 'session-1' },
      });
      expect(mockSessionUpdate).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: {
          completedAt: expect.any(Date),
          correctAnswers: 2,
        },
      });
    });

    it('should handle all correct answers', async () => {
      mockQuestionFindMany.mockResolvedValue([{ isCorrect: true }, { isCorrect: true }]);
      mockSessionUpdate.mockResolvedValue({ correctAnswers: 2 });

      await completeQuizSession('session-1');

      expect(mockSessionUpdate).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: {
          completedAt: expect.any(Date),
          correctAnswers: 2,
        },
      });
    });

    it('should handle all incorrect answers', async () => {
      mockQuestionFindMany.mockResolvedValue([{ isCorrect: false }, { isCorrect: false }]);
      mockSessionUpdate.mockResolvedValue({ correctAnswers: 0 });

      await completeQuizSession('session-1');

      expect(mockSessionUpdate).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: {
          completedAt: expect.any(Date),
          correctAnswers: 0,
        },
      });
    });
  });

  describe('getUserQuizSessions', () => {
    it('should return user sessions with questions', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          userId: 'user1',
          genreId: 'salsa',
          genre: mockGenre,
          mode: 'piano',
          totalQuestions: 10,
          correctAnswers: 7,
          completedAt: new Date(),
          createdAt: new Date(),
          questions: [
            {
              id: 'q1',
              questionNumber: 1,
              progressionId: 'p1',
              songId: null,
              progression: mockProgression,
              song: null,
              attemptsUsed: 1,
              isCorrect: true,
              userAnswer: ['I', 'IV', 'V', 'I'],
              correctAnswer: ['I', 'IV', 'V', 'I'],
            },
          ],
        },
      ];
      mockSessionFindMany.mockResolvedValue(mockSessions);

      const result = await getUserQuizSessions('user1');

      expect(mockSessionFindMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        include: {
          genre: true,
          questions: {
            include: {
              progression: true,
              song: true,
            },
            orderBy: { questionNumber: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      expect(result).toHaveLength(1);
      expect(result[0].genreName).toBe('Salsa');
    });

    it('should respect limit parameter', async () => {
      mockSessionFindMany.mockResolvedValue([]);

      await getUserQuizSessions('user1', 5);

      expect(mockSessionFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 })
      );
    });
  });

  describe('getUserQuizStats', () => {
    it('should calculate stats from completed sessions', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          genreId: 'salsa',
          genre: mockGenre,
          mode: 'piano',
          totalQuestions: 10,
          correctAnswers: 8,
          createdAt: new Date(),
          questions: [
            { isCorrect: true, progressionId: 'p1', progression: mockProgression },
            { isCorrect: false, progressionId: 'p2', progression: { ...mockProgression, id: 'p2', name: 'ii-V-I' } },
          ],
        },
        {
          id: 'session-2',
          genreId: 'salsa',
          genre: mockGenre,
          mode: 'repertoire',
          totalQuestions: 10,
          correctAnswers: 6,
          createdAt: new Date(),
          questions: [],
        },
      ];
      mockSessionFindMany.mockResolvedValue(mockSessions);

      const result = await getUserQuizStats('user1');

      expect(result.totalQuizzes).toBe(2);
      expect(result.totalQuestions).toBe(20);
      expect(result.correctAnswers).toBe(14);
      expect(result.averageScore).toBe(70);
      expect(result.bestScore).toBe(80);
      expect(result.quizzesByGenre['Salsa']).toBeDefined();
      expect(result.quizzesByMode.piano.quizCount).toBe(1);
      expect(result.quizzesByMode.repertoire.quizCount).toBe(1);
    });

    it('should return empty stats for new user', async () => {
      mockSessionFindMany.mockResolvedValue([]);

      const result = await getUserQuizStats('newuser');

      expect(result.totalQuizzes).toBe(0);
      expect(result.totalQuestions).toBe(0);
      expect(result.averageScore).toBe(0);
      expect(result.bestScore).toBe(0);
      expect(result.recentQuizzes).toEqual([]);
      expect(result.mostMissedProgressions).toEqual([]);
    });

    it('should track most missed progressions', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          genreId: 'salsa',
          genre: mockGenre,
          mode: 'piano',
          totalQuestions: 5,
          correctAnswers: 2,
          questions: [
            { isCorrect: false, progressionId: 'p1', progression: { id: 'p1', name: 'I-IV-V-I' } },
            { isCorrect: false, progressionId: 'p1', progression: { id: 'p1', name: 'I-IV-V-I' } },
            { isCorrect: false, progressionId: 'p2', progression: { id: 'p2', name: 'ii-V-I' } },
          ],
        },
      ];
      mockSessionFindMany.mockResolvedValue(mockSessions);

      const result = await getUserQuizStats('user1');

      expect(result.mostMissedProgressions.length).toBeGreaterThan(0);
      expect(result.mostMissedProgressions[0].progressionId).toBe('p1');
      expect(result.mostMissedProgressions[0].missCount).toBe(2);
    });
  });

  describe('getQuizSession', () => {
    it('should return session with full details', async () => {
      const mockSession = {
        id: 'session-1',
        userId: 'user1',
        genreId: 'salsa',
        genre: mockGenre,
        mode: 'piano',
        totalQuestions: 10,
        correctAnswers: 7,
        completedAt: new Date(),
        createdAt: new Date(),
        questions: [
          {
            id: 'q1',
            questionNumber: 1,
            progressionId: 'p1',
            songId: null,
            progression: mockProgression,
            song: null,
            attemptsUsed: 1,
            isCorrect: true,
            userAnswer: ['I', 'IV', 'V', 'I'],
            correctAnswer: ['I', 'IV', 'V', 'I'],
          },
        ],
      };
      mockSessionFindUnique.mockResolvedValue(mockSession);

      const result = await getQuizSession('session-1');

      expect(mockSessionFindUnique).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        include: {
          genre: true,
          questions: {
            include: {
              progression: true,
              song: true,
            },
            orderBy: { questionNumber: 'asc' },
          },
        },
      });
      expect(result).not.toBeNull();
      expect(result?.genreName).toBe('Salsa');
      expect(result?.questions).toHaveLength(1);
    });

    it('should return null when session not found', async () => {
      mockSessionFindUnique.mockResolvedValue(null);

      const result = await getQuizSession('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle session with song questions', async () => {
      const mockSession = {
        id: 'session-1',
        userId: 'user1',
        genreId: 'salsa',
        genre: mockGenre,
        mode: 'repertoire',
        totalQuestions: 10,
        correctAnswers: 5,
        completedAt: null,
        createdAt: new Date(),
        questions: [
          {
            id: 'q1',
            questionNumber: 1,
            progressionId: 'p1',
            songId: 's1',
            progression: mockProgression,
            song: mockSong,
            attemptsUsed: 2,
            isCorrect: false,
            userAnswer: ['wrong'],
            correctAnswer: ['I', 'IV', 'V', 'I'],
          },
        ],
      };
      mockSessionFindUnique.mockResolvedValue(mockSession);

      const result = await getQuizSession('session-1');

      expect(result?.questions[0].songTitle).toBe('Quimbara');
      expect(result?.questions[0].songYoutubeId).toBe('abc123');
      expect(result?.completedAt).toBeUndefined();
    });
  });
});
