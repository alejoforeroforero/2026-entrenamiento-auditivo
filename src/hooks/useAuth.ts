'use client';

import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';

export interface UseAuthReturn {
  session: Session | null;
  user: Session['user'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  status: 'authenticated' | 'loading' | 'unauthenticated';
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();

  return {
    session,
    user: session?.user ?? null,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    isAdmin: session?.user?.isAdmin ?? false,
    status,
  };
}
