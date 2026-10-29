'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FieldError, Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { requestPasswordReset } from '@/lib/auth/actions';
import type { AuthActionState } from '@/lib/auth/shared';

const initialState: AuthActionState = { status: 'idle' };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    requestPasswordReset,
    initialState
  );

  return (
    <form action={formAction}>
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ display: 'grid', gap: 6 }}>
          <Label htmlFor="reset-email">Work email</Label>
          <Input
            id="reset-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            required
          />
        </div>

        {state.status === 'error' && state.message ? (
          <FieldError role="alert">
            <AlertCircle size={14} /> {state.message}
          </FieldError>
        ) : null}
        {state.status === 'success' && state.message ? (
          <FieldError role="status" style={{ color: 'var(--aq-success)' }}>
            <CheckCircle2 size={14} /> {state.message}
          </FieldError>
        ) : null}

        <Button type="submit" disabled={pending} size="lg" style={{ width: '100%', marginTop: 4 }}>
          {pending ? (
            <>
              <Loader2 size={16} /> Sending link…
            </>
          ) : (
            'Email me a reset link'
          )}
        </Button>

        <p style={{ fontSize: '0.85rem', color: 'var(--aq-muted-fg)', textAlign: 'center' }}>
          Remembered it?{' '}
          <Link href="/signin" style={{ color: 'var(--aq-primary)', fontWeight: 550 }}>
            Back to sign in
          </Link>
        </p>
      </div>
    </form>
  );
}
