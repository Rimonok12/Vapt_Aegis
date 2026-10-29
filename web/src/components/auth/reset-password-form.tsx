'use client';

import { useEffect, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FieldError, Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { updatePassword } from '@/lib/auth/actions';
import type { AuthActionState } from '@/lib/auth/shared';

const initialState: AuthActionState = { status: 'idle' };

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    updatePassword,
    initialState
  );
  const router = useRouter();

  useEffect(() => {
    if (state.status === 'success') {
      const timer = setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 900);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [state.status, router]);

  return (
    <form action={formAction}>
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ display: 'grid', gap: 6 }}>
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            minLength={8}
            required
          />
        </div>
        <div style={{ display: 'grid', gap: 6 }}>
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat it once more"
            minLength={8}
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
              <Loader2 size={16} className="aq-spin" /> Updating…
            </>
          ) : (
            'Set new password'
          )}
        </Button>
      </div>
    </form>
  );
}
