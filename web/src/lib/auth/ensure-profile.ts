import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { env } from '@/lib/env';
import type { User } from '@supabase/supabase-js';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 28);
}

/**
 * Guarantee an `organizations` + `profiles` row exists for a signed-in user.
 *
 * Runs with the service key, so it works even when the database has no
 * `handle_new_user` trigger. Idempotent: safe to call on every request until
 * the profile row appears. Each signup gets its own organisation — sharing an
 * org by name match would let anyone join another tenant just by typing its
 * name, so admins merge or reassign organisations explicitly instead.
 *
 * A profile created elsewhere (e.g. a `handle_new_user` DB trigger) without an
 * organisation is repaired in place: it gets its own organisation attached.
 */
export async function ensureProfile(user: User): Promise<void> {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from('profiles')
    .select('id, organization_id')
    .eq('id', user.id)
    .maybeSingle();
  if (existing?.organization_id) return;

  const meta = user.user_metadata ?? {};
  const email = user.email ?? '';
  const fullName =
    typeof meta.full_name === 'string' && meta.full_name.trim()
      ? meta.full_name.trim()
      : email.split('@')[0] || 'Member';
  const organizationName =
    typeof meta.organization_name === 'string' && meta.organization_name.trim()
      ? meta.organization_name.trim()
      : `${fullName}'s organisation`;

  const role =
    env().bootstrapAdminEmail && email.toLowerCase() === env().bootstrapAdminEmail
      ? 'admin'
      : 'client';

  const baseSlug = slugify(organizationName) || 'org';
  const suffix = crypto.randomUUID().slice(0, 8);

  const { data: org, error: orgError } = await admin
    .from('organizations')
    .insert({ name: organizationName, slug: `${baseSlug}-${suffix}` })
    .select('id')
    .single();
  if (orgError || !org) {
    throw new Error(`Unable to create organisation: ${orgError?.message ?? 'unknown'}`);
  }

  if (existing) {
    // Only promote, never demote: an existing admin keeps their role.
    const { error: repairError } = await admin
      .from('profiles')
      .update({
        organization_id: org.id,
        ...(role === 'admin' ? { role } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .is('organization_id', null);
    if (repairError) {
      throw new Error(`Unable to attach organisation: ${repairError.message}`);
    }
    return;
  }

  const { error: profileError } = await admin.from('profiles').insert({
    id: user.id,
    organization_id: org.id,
    email,
    full_name: fullName,
    role,
    nid_verified: false,
  });
  if (profileError) {
    throw new Error(`Unable to create profile: ${profileError.message}`);
  }
}
