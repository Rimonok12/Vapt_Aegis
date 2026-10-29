import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';

import { ensureProfile } from '@/lib/auth/ensure-profile';
import { createAuthClient } from '@/lib/supabase/server';
import type { OrganizationRow, ProfileRow, SessionContext } from '@/lib/types';

/**
 * Resolve the signed-in user and their profile. Memoised with React `cache()`
 * so a page, its `generateMetadata` and any nested component share one lookup
 * per request instead of three.
 */
export const getSession = cache(async (): Promise<SessionContext | null> => {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  // Self-heal: create the organisation + profile rows if the DB trigger did not
  // (or attach an organisation to a trigger-created profile that lacks one).
  if (!profile || !profile.organization_id) {
    try {
      await ensureProfile(user);
    } catch {
      // Repair failed: keep the existing (org-less) profile rather than
      // treating a signed-in user as signed out.
      if (!profile) return null;
      return buildSession(user.id, user.email ?? profile.email ?? null, profile as ProfileRow);
    }
    const { data: created } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    if (!created) return null;
    return buildSession(user.id, user.email ?? created.email ?? null, created as ProfileRow);
  }

  return buildSession(user.id, user.email ?? profile.email ?? null, profile as ProfileRow);
});

async function buildSession(
  userId: string,
  email: string | null,
  profile: ProfileRow
): Promise<SessionContext> {
  let organization: OrganizationRow | null = null;
  if (profile.organization_id && profile.nid_verified) {
    const supabase = await createAuthClient();
    const { data } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.organization_id)
      .maybeSingle();
    organization = (data as OrganizationRow | null) ?? null;
  }

  return { userId, email, profile, organization };
}

/** Require any signed-in user. Redirects to /signin otherwise. */
export async function requireUser(): Promise<SessionContext> {
  const session = await getSession();
  if (!session) {
    redirect('/signin');
  }
  return session;
}

/**
 * Require a signed-in user that has passed the National ID gateway. Until then
 * the only place they may go is the verification screen.
 */
export async function requireVerifiedUser(): Promise<SessionContext> {
  const session = await requireUser();
  if (!session.profile.nid_verified) {
    redirect('/verify');
  }
  return session;
}

/** Require an NID-verified administrator. */
export async function requireAdmin(): Promise<SessionContext> {
  const session = await requireVerifiedUser();
  if (session.profile.role !== 'admin') {
    redirect('/dashboard');
  }
  return session;
}
