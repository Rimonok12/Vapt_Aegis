import { NextResponse, type NextRequest } from 'next/server';

import { ensureProfile } from '@/lib/auth/ensure-profile';
import { createAuthClient } from '@/lib/supabase/server';

/**
 * Handles Supabase email-confirm / magic-link redirects (`next` param).
 * Exchange the code for a session, make sure the profile exists, then send
 * the user to the NID gateway.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const nextParam = searchParams.get('next') ?? '/verify';
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/verify';

  if (!code) {
    return NextResponse.redirect(`${origin}/signin?error=missing-code`);
  }

  const supabase = await createAuthClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    // Map common failure modes to codes the sign-in page understands.
    const expired = /expired|invalid/i.test(error.message);
    const params = new URLSearchParams();
    if (expired) params.set('error_code', 'otp_expired');
    else params.set('error', error.message);
    return NextResponse.redirect(`${origin}/signin?${params.toString()}`);
  }

  if (data.user) {
    try {
      await ensureProfile(data.user);
    } catch {
      // Profile creation is retried on the next authenticated request by proxy.
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
