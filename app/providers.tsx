'use client';

import { SessionProvider } from 'next-auth/react';
import { WatchlistProvider } from './contexts/WatchlistContext';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <WatchlistProvider>
        {children}
      </WatchlistProvider>
    </SessionProvider>
  );
}
