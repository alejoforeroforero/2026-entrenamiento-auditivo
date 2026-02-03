import { renderHook } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useAuth } from '../useAuth';
import type { Session } from 'next-auth';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

describe('useAuth', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when user is authenticated', () => {
    const mockSession: Session = {
      user: {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/avatar.jpg',
        isAdmin: false,
      },
      expires: '2026-12-31',
    };

    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
        update: jest.fn(),
      });
    });

    it('should return authenticated session', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.session).toEqual(mockSession);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.status).toBe('authenticated');
    });

    it('should return user data', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toEqual(mockSession.user);
      expect(result.current.user?.id).toBe('123');
      expect(result.current.user?.name).toBe('Test User');
      expect(result.current.user?.email).toBe('test@example.com');
    });

    it('should return isAdmin false for non-admin user', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isAdmin).toBe(false);
    });

    it('should return isAdmin true for admin user', () => {
      const adminSession: Session = {
        ...mockSession,
        user: {
          ...mockSession.user,
          isAdmin: true,
        },
      };

      mockUseSession.mockReturnValue({
        data: adminSession,
        status: 'authenticated',
        update: jest.fn(),
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isAdmin).toBe(true);
      expect(result.current.user?.isAdmin).toBe(true);
    });

    it('should handle user with all properties', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toMatchObject({
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/avatar.jpg',
        isAdmin: false,
      });
    });
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });
    });

    it('should return null session and user', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.session).toBeNull();
      expect(result.current.user).toBeNull();
    });

    it('should return isAuthenticated false', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should return isLoading false', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);
    });

    it('should return isAdmin false', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isAdmin).toBe(false);
    });

    it('should return unauthenticated status', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.status).toBe('unauthenticated');
    });
  });

  describe('when session is loading', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn(),
      });
    });

    it('should return null session and user', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.session).toBeNull();
      expect(result.current.user).toBeNull();
    });

    it('should return isLoading true', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
    });

    it('should return isAuthenticated false during loading', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should return isAdmin false during loading', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isAdmin).toBe(false);
    });

    it('should return loading status', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.status).toBe('loading');
    });
  });

  describe('edge cases', () => {
    it('should handle session with undefined user properties', () => {
      const partialSession: Session = {
        user: {
          id: '456',
          isAdmin: false,
        },
        expires: '2026-12-31',
      };

      mockUseSession.mockReturnValue({
        data: partialSession,
        status: 'authenticated',
        update: jest.fn(),
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toEqual(partialSession.user);
      expect(result.current.user?.name).toBeUndefined();
      expect(result.current.user?.email).toBeUndefined();
      expect(result.current.user?.image).toBeUndefined();
    });

    it('should handle session with null image', () => {
      const sessionWithNullImage: Session = {
        user: {
          id: '789',
          name: 'User Without Avatar',
          email: 'noavatar@example.com',
          image: null,
          isAdmin: false,
        },
        expires: '2026-12-31',
      };

      mockUseSession.mockReturnValue({
        data: sessionWithNullImage,
        status: 'authenticated',
        update: jest.fn(),
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.user?.image).toBeNull();
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle session with undefined name', () => {
      const sessionWithoutName: Session = {
        user: {
          id: '101',
          email: 'noname@example.com',
          isAdmin: false,
        },
        expires: '2026-12-31',
      };

      mockUseSession.mockReturnValue({
        data: sessionWithoutName,
        status: 'authenticated',
        update: jest.fn(),
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.user?.name).toBeUndefined();
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle expired session', () => {
      const expiredSession: Session = {
        user: {
          id: '999',
          name: 'Expired User',
          email: 'expired@example.com',
          isAdmin: false,
        },
        expires: '2020-01-01',
      };

      mockUseSession.mockReturnValue({
        data: expiredSession,
        status: 'authenticated',
        update: jest.fn(),
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.session).toEqual(expiredSession);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('status transitions', () => {
    it('should handle transition from loading to authenticated', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn(),
      });

      const { result, rerender } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);

      const authenticatedSession: Session = {
        user: {
          id: '111',
          name: 'New User',
          email: 'new@example.com',
          isAdmin: false,
        },
        expires: '2026-12-31',
      };

      mockUseSession.mockReturnValue({
        data: authenticatedSession,
        status: 'authenticated',
        update: jest.fn(),
      });

      rerender();

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(authenticatedSession.user);
    });

    it('should handle transition from loading to unauthenticated', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn(),
      });

      const { result, rerender } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);

      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      rerender();

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.status).toBe('unauthenticated');
    });

    it('should handle transition from authenticated to unauthenticated', () => {
      const initialSession: Session = {
        user: {
          id: '222',
          name: 'Logged In User',
          email: 'loggedin@example.com',
          isAdmin: false,
        },
        expires: '2026-12-31',
      };

      mockUseSession.mockReturnValue({
        data: initialSession,
        status: 'authenticated',
        update: jest.fn(),
      });

      const { result, rerender } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(initialSession.user);

      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      rerender();

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });
  });

  describe('return value structure', () => {
    it('should return all expected properties', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current).toHaveProperty('session');
      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('isAuthenticated');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('isAdmin');
      expect(result.current).toHaveProperty('status');
    });

    it('should return consistent types', () => {
      const session: Session = {
        user: {
          id: '333',
          name: 'Type Check User',
          email: 'typecheck@example.com',
          isAdmin: true,
        },
        expires: '2026-12-31',
      };

      mockUseSession.mockReturnValue({
        data: session,
        status: 'authenticated',
        update: jest.fn(),
      });

      const { result } = renderHook(() => useAuth());

      expect(typeof result.current.isAuthenticated).toBe('boolean');
      expect(typeof result.current.isLoading).toBe('boolean');
      expect(typeof result.current.isAdmin).toBe('boolean');
      expect(typeof result.current.status).toBe('string');
    });
  });

  describe('admin functionality', () => {
    it('should correctly identify admin users', () => {
      const adminSession: Session = {
        user: {
          id: 'admin-1',
          name: 'Admin User',
          email: 'admin@example.com',
          isAdmin: true,
        },
        expires: '2026-12-31',
      };

      mockUseSession.mockReturnValue({
        data: adminSession,
        status: 'authenticated',
        update: jest.fn(),
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle transition from regular user to admin', () => {
      const regularSession: Session = {
        user: {
          id: 'user-1',
          name: 'Regular User',
          email: 'user@example.com',
          isAdmin: false,
        },
        expires: '2026-12-31',
      };

      mockUseSession.mockReturnValue({
        data: regularSession,
        status: 'authenticated',
        update: jest.fn(),
      });

      const { result, rerender } = renderHook(() => useAuth());

      expect(result.current.isAdmin).toBe(false);

      const adminSession: Session = {
        user: {
          ...regularSession.user,
          isAdmin: true,
        },
        expires: '2026-12-31',
      };

      mockUseSession.mockReturnValue({
        data: adminSession,
        status: 'authenticated',
        update: jest.fn(),
      });

      rerender();

      expect(result.current.isAdmin).toBe(true);
    });
  });
});
