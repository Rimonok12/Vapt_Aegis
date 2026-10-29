'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { getFramework, sanitizeAnswers, scoreAudit } from '@/lib/audits/frameworks';
import { requireAdmin } from '@/lib/auth/session';
import { planOf } from '@/lib/plans';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Audit writes. RLS lets members read their organisation's audits; every
 * write goes through the service client here after an admin + organisation
 * check, and the score is always recomputed on the server.
 */

export async function createAudit(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const organizationId = session.profile.organization_id;
  if (!organizationId) redirect('/audits?error=no-org');
  if (!planOf(session.organization?.plan).itAudits) redirect('/pricing');

  const framework = getFramework(String(formData.get('framework') ?? ''));
  if (!framework) redirect('/audits?error=framework');

  const title =
    String(formData.get('title') ?? '').trim().slice(0, 120) ||
    `${framework.short} · ${new Date().toLocaleDateString('en-GB')}`;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('audits')
    .insert({
      organization_id: organizationId,
      framework: framework.id,
      title,
      created_by: session.userId,
    })
    .select('id')
    .single();
  if (error || !data) redirect('/audits?error=create');

  revalidatePath('/audits');
  redirect(`/audits/${data.id}`);
}

const saveSchema = z.object({
  auditId: z.string().uuid(),
  answers: z.record(z.string(), z.unknown()),
  complete: z.boolean().optional(),
});

export async function saveAudit(
  input: unknown
): Promise<{ ok: boolean; score?: number | null; message?: string }> {
  const session = await requireAdmin();
  const organizationId = session.profile.organization_id;
  if (!organizationId) return { ok: false, message: 'No organisation attached to your account.' };

  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: 'Invalid request.' };

  const admin = createAdminClient();
  const { data: audit } = await admin
    .from('audits')
    .select('id, framework, status')
    .eq('id', parsed.data.auditId)
    .eq('organization_id', organizationId)
    .maybeSingle();
  if (!audit) return { ok: false, message: 'Audit not found in your organisation.' };

  const framework = getFramework(audit.framework);
  if (!framework) return { ok: false, message: 'Unknown checklist.' };

  const answers = sanitizeAnswers(framework, parsed.data.answers);
  const { score, answered, total } = scoreAudit(framework, answers);
  const now = new Date().toISOString();
  const complete = parsed.data.complete === true;
  if (complete && answered < total) {
    return { ok: false, message: `Answer all ${total} controls before completing the audit.` };
  }

  const { error } = await admin
    .from('audits')
    .update({
      answers,
      score,
      updated_at: now,
      ...(complete ? { status: 'completed' as const, completed_at: now } : {}),
    })
    .eq('id', audit.id)
    .eq('organization_id', organizationId);
  if (error) return { ok: false, message: error.message };

  revalidatePath('/audits');
  revalidatePath(`/audits/${audit.id}`);
  return { ok: true, score };
}

export async function reopenAudit(auditId: string): Promise<void> {
  const session = await requireAdmin();
  const organizationId = session.profile.organization_id;
  if (!organizationId || !z.string().uuid().safeParse(auditId).success) return;
  await createAdminClient()
    .from('audits')
    .update({ status: 'draft', completed_at: null, updated_at: new Date().toISOString() })
    .eq('id', auditId)
    .eq('organization_id', organizationId);
  revalidatePath(`/audits/${auditId}`);
}
