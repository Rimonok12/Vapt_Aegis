import type { Metadata } from 'next';

import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata: Metadata = { title: 'Choose a new password' };

// Reached right after the reset link exchanges its code for a session.
export const instant = false;

export default function ResetPasswordPage() {
  return (
    <div style={{ display: 'grid', gap: 26 }}>
      <div style={{ display: 'grid', gap: 6 }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 680, letterSpacing: '-0.03em' }}>
          Choose a new password
        </h2>
        <p style={{ color: 'var(--aq-muted-fg)', fontSize: '0.9rem' }}>
          Pick something long and unique — you&apos;ll use it to sign in from now on.
        </p>
      </div>

      <ResetPasswordForm />
    </div>
  );
}
