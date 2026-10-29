'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/admin';
import type { UserRole } from '@/lib/types';

const roleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['admin', 'client']),
});

/**
 * Promote or demote a member of the caller's organisation. Every write uses the
 * service client — RLS intentionally blocks members from changing roles — so the
 * organisation scope is enforced here in code instead.
 */
export async function setMemberRole(input: unknown): Promise<{ ok: boolean; message?: string }> {
  const session = await requireAdmin();
  const organizationId = session.profile.organization_id;
  if (!organizationId) return { ok: false, message: 'No organisation attached to your account.' };

  const parsed = roleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: 'Invalid request.' };

  const { userId, role } = parsed.data;
  if (userId === session.userId) return { ok: false, message: 'You cannot change your own role.' };

  const admin = createAdminClient();

  // Only touch profiles inside the caller's own organisation.
  const { data: target } = await admin
    .from('profiles')
    .select('id, role, organization_id')
    .eq('id', userId)
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (!target) return { ok: false, message: 'Member not found in your organisation.' };
  if (target.role === 'admin' && role === 'client') {
    const { count } = await admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('role', 'admin');
    if ((count ?? 0) <= 1)
      return { ok: false, message: 'An organisation needs at least one admin.' };
  }

  const { error } = await admin
    .from('profiles')
    .update({ role: role as UserRole, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .eq('organization_id', organizationId);

  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin/tenants');
  return { ok: true };
}
