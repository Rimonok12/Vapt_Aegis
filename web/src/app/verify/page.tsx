import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Brand } from '@/components/brand';
import { ThemeToggle } from '@/components/theme-toggle';
import { VerifyForm } from '@/components/auth/verify-form';
import { signOut } from '@/lib/auth/actions';
import { getSession } from '@/lib/auth/session';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Verify identity' };

// Per-request page: renders the signed-in user's email and redirects.
export const instant = false;

export default async function VerifyPage() {
  const session = await getSession();
  if (!session) redirect('/signin?next=/verify');
  if (session.profile.nid_verified) redirect('/dashboard');

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px 40px',
        position: 'relative',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backgroundImage:
            'linear-gradient(to right, var(--aq-grid) 1px, transparent 1px), linear-gradient(to bottom, var(--aq-grid) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(ellipse 70% 55% at 50% 30%, #000 35%, transparent 80%)',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 460,
          display: 'grid',
          gap: 22,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link href="/">
            <Brand />
          </Link>
          <ThemeToggle />
        </div>

        <div style={{ display: 'grid', gap: 6, textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 680, letterSpacing: '-0.03em' }}>
            One quick identity check
          </h1>
          <p style={{ color: 'var(--aq-muted-fg)', fontSize: '0.9rem' }}>
            Bangladesh National ID verification protects every report on this platform.
          </p>
        </div>

        <VerifyForm email={session.email} />

        <form action={signOut} style={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant="ghost" size="sm" type="submit">
            Sign out
          </Button>
        </form>
      </div>
    </main>
  );
}
