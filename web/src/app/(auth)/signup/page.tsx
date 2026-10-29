import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { SignUpForm } from '@/components/auth/sign-up-form';
import { getSession } from '@/lib/auth/session';

export const metadata: Metadata = { title: 'Create account' };

// Per-request page: the session check + redirect can't be prerendered.
export const instant = false;

export default async function SignUpPage() {
  const session = await getSession();
  if (session) {
    redirect(session.profile.nid_verified ? '/dashboard' : '/verify');
  }

  return (
    <div style={{ display: 'grid', gap: 26 }}>
      <div style={{ display: 'grid', gap: 6 }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 680, letterSpacing: '-0.03em' }}>
          Create your account
        </h2>
        <p style={{ color: 'var(--aq-muted-fg)', fontSize: '0.9rem' }}>
          Set up a secure tenant for your organisation&apos;s vulnerability reports.
        </p>
      </div>

      <SignUpForm />

      <p style={{ fontSize: '0.85rem', color: 'var(--aq-muted-fg)', textAlign: 'center' }}>
        Already registered?{' '}
        <Link href="/signin" style={{ color: 'var(--aq-primary)', fontWeight: 550 }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
