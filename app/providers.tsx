'use client';

import { SessionProvider } from 'next-auth/react';
import { WatchlistProvider } from './contexts/WatchlistContext';
import { ConversationsProvider } from './contexts/ConversationsContext';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <ConversationsProvider>
        <WatchlistProvider>
          {children}
        </WatchlistProvider>
      </ConversationsProvider>
    </SessionProvider>
  );
}
