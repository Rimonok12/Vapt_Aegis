import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { planOf, type Plan } from '@/lib/plans';

export type PlanUsage = {
  plan: Plan;
  used: number;
  /** null = unlimited */
  limit: number | null;
  remaining: number | null;
  canUpload: boolean;
};

/**
 * Report quota for an organisation. Counts with the service client so the
 * check also works inside route handlers. The plan column comes from
 * migration 002; before it is applied every organisation is on the trial.
 */
export async function getPlanUsage(organizationId: string): Promise<PlanUsage> {
  const admin = createAdminClient();

  const { data: org } = await admin
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .maybeSingle();
  const plan = planOf((org as { plan?: string } | null)?.plan);

  let query = admin
    .from('reports')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    // Failed uploads don't use up the quota.
    .neq('status', 'failed');
  if (plan.reportLimitPeriod === 'month') {
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    query = query.gte('created_at', monthStart.toISOString());
  }
  const { count } = await query;
  const used = count ?? 0;

  const limit = plan.reportLimit;
  const remaining = limit === null ? null : Math.max(0, limit - used);
  return { plan, used, limit, remaining, canUpload: remaining === null || remaining > 0 };
}
