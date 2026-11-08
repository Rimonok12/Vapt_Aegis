import { NextResponse, type NextRequest } from 'next/server';

import { createDiditSession, diditConfigured } from '@/lib/auth/didit';
import { markNidVerified, recordAttempt } from '@/lib/auth/identity';
import { getSession } from '@/lib/auth/session';
import { nidSchema, toPorichoyDate } from '@/lib/auth/nid';
import { verifyNationalId } from '@/lib/auth/porichoy';
import { env } from '@/lib/env';
import { createAdminClient } from '@/lib/supabase/admin';

/** Max failures inside the lockout window before we stop calling the gateway. */
const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 30;

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'Not authenticated.' }, { status: 401 });
  }
  if (session.profile.nid_verified) {
    return NextResponse.json({ message: 'Already verified.', redirect: '/dashboard' });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = nidSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json({ message: first?.message ?? 'Invalid input.' }, { status: 422 });
  }

  const admin = createAdminClient();
  const since = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString();

  // Rate limit: count recent failures. Successful attempts are never repeated.
  const { count } = await admin
    .from('nid_verification_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', session.userId)
    .eq('succeeded', false)
    .gte('created_at', since);

  if ((count ?? 0) >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { message: 'Too many failed attempts. Please try again in 30 minutes.' },
      { status: 429 }
    );
  }

  // Didit (card photo + live selfie) is used unless a direct Porichoy key is set.
  if (!env().porichoyKey && diditConfigured()) {
    const started = await createDiditSession({
      userId: session.userId,
      nid: parsed.data.nid,
      dateOfBirth: parsed.data.dateOfBirth,
      callback: `${env().appUrl}/api/kyc/didit/callback`,
    });
    if (!started.ok) {
      return NextResponse.json({ message: started.message }, { status: 502 });
    }
    return NextResponse.json({ message: 'Continue on the secure page.', redirect: started.url, external: true });
  }

  const result = await verifyNationalId(parsed.data.nid, toPorichoyDate(parsed.data.dateOfBirth));

  // Record the attempt — success flag + coarse reason only, never the NID itself.
  await recordAttempt(session.userId, result.ok, result.ok ? null : `http:${result.code}`);

  if (!result.ok) {
    return NextResponse.json(
      { message: result.message || 'National ID and date of birth do not match.' },
      { status: result.code === 503 ? 503 : 400 }
    );
  }

  if (!(await markNidVerified(session.userId))) {
    return NextResponse.json({ message: 'Verified but failed to save.' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Identity verified.', redirect: '/dashboard' });
}
