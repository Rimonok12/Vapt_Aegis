import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { SignInForm } from '@/components/auth/sign-in-form';
import { Skeleton } from '@/components/ui/skeleton';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Sign in' };

// Per-request page: session check + searchParams can't be prerendered.
export const instant = false;

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  const { next } = await searchParams;
  if (session) {
    redirect(session.profile.nid_verified ? '/dashboard' : '/verify');
  }

  return (
    <div style={{ display: 'grid', gap: 26 }}>
      <div style={{ display: 'grid', gap: 6 }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 680, letterSpacing: '-0.03em' }}>
          Welcome back
        </h2>
        <p style={{ color: 'var(--aq-muted-fg)', fontSize: '0.9rem' }}>
          Sign in to access your organisation&apos;s vulnerability reports.
        </p>
      </div>

      <Suspense fallback={<Skeleton style={{ height: 220 }} />}>
        <SignInForm next={next} />
      </Suspense>

      <p style={{ fontSize: '0.85rem', color: 'var(--aq-muted-fg)', textAlign: 'center' }}>
        New here?{' '}
        <Link href="/signup" style={{ color: 'var(--aq-primary)', fontWeight: 550 }}>
          Create an account
        </Link>
      </p>
    </div>
  );
}
