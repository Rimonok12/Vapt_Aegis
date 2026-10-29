'use client';

import { useActionState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FieldDescription, FieldError, Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { signUpWithPassword } from '@/lib/auth/actions';
import type { AuthActionState } from '@/lib/auth/shared';

const initialState: AuthActionState = { status: 'idle' };

export function SignUpForm() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    signUpWithPassword,
    initialState
  );

  return (
    <form action={formAction}>
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ display: 'grid', gap: 6 }}>
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            placeholder="Ada Lovelace"
            required
          />
        </div>

        <div style={{ display: 'grid', gap: 6 }}>
          <Label htmlFor="organizationName">Organisation</Label>
          <Input
            id="organizationName"
            name="organizationName"
            autoComplete="organization"
            placeholder="Acme Bank Ltd."
            required
          />
          <FieldDescription>
            Creates a dedicated tenant. An administrator can reassign it later.
          </FieldDescription>
        </div>

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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
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
              <Loader2 size={16} /> Creating account…
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </div>
    </form>
  );
}
