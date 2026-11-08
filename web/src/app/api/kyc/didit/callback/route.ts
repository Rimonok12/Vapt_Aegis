import { NextResponse, type NextRequest } from 'next/server';

import { applyDiditSession } from '@/lib/auth/identity';
import { getSession } from '@/lib/auth/session';

/**
 * Didit sends the browser here after the hosted check, with
 * ?verificationSessionId=…&status=…. The status in the URL is ignored: the
 * decision is fetched from Didit with our API key and checked server-side.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL('/signin?next=/verify', url));
  if (session.profile.nid_verified) return NextResponse.redirect(new URL('/dashboard', url));

  const sessionId = url.searchParams.get('verificationSessionId') ?? '';
  const outcome = await applyDiditSession(sessionId, session.userId);

  if (outcome.state === 'approved') return NextResponse.redirect(new URL('/dashboard', url));
  const target = new URL('/verify', url);
  target.searchParams.set('kyc', outcome.state);
  target.searchParams.set('message', outcome.reason);
  return NextResponse.redirect(target);
}
