'use client';

import { useMemo } from 'react';
import { useActionState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, Loader2, MailWarning } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FieldError, Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { resendConfirmation, signInWithPassword } from '@/lib/auth/actions';
import type { AuthActionState } from '@/lib/auth/shared';

const initialState: AuthActionState = { status: 'idle' };

const FRIENDLY: Record<string, string> = {
  otp_expired: 'That confirmation link has expired. Request a fresh one below.',
  missing_code: 'Sign-in link is invalid or expired.',
  invalid_credentials: 'Email or password is incorrect.',
};

export function SignInForm({ next = '/dashboard' }: { next?: string }) {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    signInWithPassword,
    initialState
  );
  const [resendState, resendAction, resendPending] = useActionState<AuthActionState, FormData>(
    resendConfirmation,
    initialState
  );
  const searchParams = useSearchParams();
  const queryError = searchParams.get('error');
  const errorCode = searchParams.get('error_code');
  const expired = errorCode === 'otp_expired' || queryError === 'otp_expired';
  const justRegistered = searchParams.get('registered') === '1';

  const message = useMemo(() => {
    if (state.message) return state.message;
    if (errorCode && FRIENDLY[errorCode]) return FRIENDLY[errorCode];
    if (queryError === 'missing-code') return FRIENDLY.missing_code;
    if (queryError && queryError !== 'access_denied') return decodeURIComponent(queryError);
    return null;
  }, [state.message, queryError, errorCode]);

  return (
    <form action={formAction}>
      <div style={{ display: 'grid', gap: 16 }}>
        <input type="hidden" name="next" value={next} />
        <div style={{ display: 'grid', gap: 6 }}>
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            required
          />
        </div>
        <div style={{ display: 'grid', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              style={{ fontSize: '0.78rem', color: 'var(--aq-primary)', fontWeight: 550 }}
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
        </div>

        {justRegistered ? (
          <FieldError role="status" style={{ color: 'var(--aq-success)' }}>
            <CheckCircle2 size={14} /> Account created. Confirm your email from the inbox link, then
            sign in here.
          </FieldError>
        ) : null}

        {message ? (
          <FieldError role="alert">
            <AlertCircle size={14} /> {message}
          </FieldError>
        ) : null}

        <Button type="submit" disabled={pending} size="lg" style={{ width: '100%', marginTop: 4 }}>
          {pending ? (
            <>
              <Loader2 size={16} className="aq-spin" /> Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </Button>

        {expired ? (
          <div
            style={{
              display: 'grid',
              gap: 10,
              padding: 14,
              borderRadius: 12,
              border: '1px dashed var(--aq-border)',
              background: 'var(--aq-accent)',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                fontSize: '0.85rem',
                fontWeight: 560,
              }}
            >
              <MailWarning size={15} /> Resend confirmation email
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Input
                name="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                required
                style={{ flex: 1 }}
              />
              <Button type="submit" formAction={resendAction} disabled={resendPending}>
                {resendPending ? <Loader2 size={15} className="aq-spin" /> : 'Resend'}
              </Button>
            </div>
            {resendState.message ? (
              <FieldError
                role="status"
                style={{
                  color: resendState.status === 'error' ? undefined : 'var(--aq-success)',
                }}
              >
                {resendState.message}
              </FieldError>
            ) : null}
          </div>
        ) : null}
      </div>
    </form>
  );
}
