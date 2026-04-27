'use client';

import { AppStateProvider } from '@/lib/app-state';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return <AppStateProvider>{children}</AppStateProvider>;
}
