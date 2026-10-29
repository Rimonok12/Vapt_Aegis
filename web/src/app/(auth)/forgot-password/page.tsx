import type { Metadata } from 'next';

import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata: Metadata = { title: 'Forgot password' };

// Per-request page: shares the auth layout's session-free flow.
export const instant = false;

export default function ForgotPasswordPage() {
  return (
    <div style={{ display: 'grid', gap: 26 }}>
      <div style={{ display: 'grid', gap: 6 }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 680, letterSpacing: '-0.03em' }}>
          Reset your password
        </h2>
        <p style={{ color: 'var(--aq-muted-fg)', fontSize: '0.9rem' }}>
          We&apos;ll email you a secure one-time link to choose a new password.
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  );
}
