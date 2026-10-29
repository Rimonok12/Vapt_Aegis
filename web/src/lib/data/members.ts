import 'server-only';

import { cache } from 'react';

import { createAuthClient } from '@/lib/supabase/server';
import type { ProfileRow } from '@/lib/types';

/** Members of the caller's organisation (RLS-scoped; admins only call this). */
export const listMembers = cache(async (organizationId: string): Promise<ProfileRow[]> => {
  const supabase = await createAuthClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to load members: ${error.message}`);
  return (data ?? []) as ProfileRow[];
});

/** Organisation-wide stats for the tenants overview (admin client). */
export const listOrganizationStats = cache(
  async (
    organizationId: string
  ): Promise<{ members: number; reports: number; verified: number }> => {
    const supabase = await createAuthClient();
    const [profiles, reports] = await Promise.all([
      supabase.from('profiles').select('id, nid_verified').eq('organization_id', organizationId),
      supabase
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId),
    ]);
    if (profiles.error) throw new Error(`Failed to load members: ${profiles.error.message}`);
    const rows = profiles.data ?? [];
    return {
      members: rows.length,
      verified: rows.filter((row) => row.nid_verified === true).length,
      reports: reports.count ?? 0,
    };
  }
);
