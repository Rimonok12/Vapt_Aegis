import 'server-only';

import { cache } from 'react';

import type { Answers } from '@/lib/audits/frameworks';
import { createAuthClient } from '@/lib/supabase/server';

export type AuditRow = {
  id: string;
  organization_id: string;
  framework: string;
  title: string;
  answers: Answers;
  score: number | null;
  status: 'draft' | 'completed';
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

/** `missing` = migration 002 has not been applied yet. */
export type AuditList = { audits: AuditRow[]; missing: boolean };

function isMissingTable(message: string | undefined): boolean {
  return /relation .*audits.* does not exist|could not find the table|schema cache/i.test(
    message ?? ''
  );
}

/** Audits of the caller's verified organisation (RLS-scoped), newest first. */
export const listAudits = cache(async (): Promise<AuditList> => {
  const supabase = await createAuthClient();
  const { data, error } = await supabase
    .from('audits')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) {
    if (isMissingTable(error.message)) return { audits: [], missing: true };
    throw new Error(`Failed to load audits: ${error.message}`);
  }
  return { audits: (data ?? []) as unknown as AuditRow[], missing: false };
});

export const getAudit = cache(async (id: string): Promise<AuditRow | null> => {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createAuthClient();
  const { data, error } = await supabase.from('audits').select('*').eq('id', id).maybeSingle();
  if (error) {
    if (isMissingTable(error.message)) return null;
    throw new Error(`Failed to load audit: ${error.message}`);
  }
  return (data as unknown as AuditRow | null) ?? null;
});
