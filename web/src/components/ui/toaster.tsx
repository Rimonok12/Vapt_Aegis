'use client';

import { Toaster as SonnerToaster } from 'sonner';

/** App-wide toast host; mount once in the root layout. */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'var(--aq-card)',
          color: 'var(--aq-fg)',
          border: '1px solid var(--aq-border)',
          borderRadius: '12px',
          boxShadow: 'var(--aq-shadow-lg)',
          fontFamily: 'var(--font-geist-sans)',
        },
      }}
    />
  );
}
