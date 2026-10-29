'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Fingerprint, Loader2, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FieldDescription, FieldError, Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function VerifyForm({ email }: { email: string | null }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      nid: String(form.get('nid') ?? '').trim(),
      dateOfBirth: String(form.get('dateOfBirth') ?? '').trim(),
    };

    try {
      const response = await fetch('/api/verify-nid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { message?: string; redirect?: string };

      if (!response.ok) {
        setError(data.message ?? 'Verification failed.');
        setPending(false);
        return;
      }

      router.replace(data.redirect ?? '/dashboard');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Fingerprint size={18} /> National ID verification
          </span>
        </CardTitle>
        <CardDescription>
          {email ? `Confirming identity for ${email}. ` : ''}
          This one-time check unlocks your organisation&apos;s reports.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'grid', gap: 6 }}>
              <Label htmlFor="nid">National ID number</Label>
              <Input
                id="nid"
                name="nid"
                inputMode="numeric"
                autoComplete="off"
                placeholder="10, 13 or 17 digits"
                pattern="\d{10}|\d{13}|\d{17}"
                required
              />
              <FieldDescription>
                Used only to call the Porichoy gateway. Never stored or logged.
              </FieldDescription>
            </div>

            <div style={{ display: 'grid', gap: 6 }}>
              <Label htmlFor="dateOfBirth">Date of birth</Label>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" required max={today()} />
            </div>

            {error ? (
              <FieldError role="alert">
                <AlertCircle size={14} /> {error}
              </FieldError>
            ) : null}

            <Button type="submit" disabled={pending} size="lg" style={{ width: '100%' }}>
              {pending ? (
                <>
                  <Loader2 size={16} className="aq-spin" /> Verifying…
                </>
              ) : (
                <>
                  <ShieldCheck size={16} /> Verify identity
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function today() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
