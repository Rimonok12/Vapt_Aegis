'use client';

import { Toaster } from '@/components/ui/toaster';

/** Client shell mounted inside every layout: toasts + ambient providers. */
export function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
