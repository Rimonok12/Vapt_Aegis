import 'server-only';

import { evaluateDecision, getDiditDecision, type DiditOutcome } from '@/lib/auth/didit';
import { createAdminClient } from '@/lib/supabase/admin';

/** Flip the profile to verified. Idempotent. */
export async function markNidVerified(userId: string): Promise<boolean> {
  const now = new Date().toISOString();
  const { error } = await createAdminClient()
    .from('profiles')
    .update({ nid_verified: true, nid_verified_at: now, updated_at: now })
    .eq('id', userId);
  return !error;
}

export async function recordAttempt(userId: string, succeeded: boolean, reason: string | null) {
  await createAdminClient()
    .from('nid_verification_attempts')
    .insert({ user_id: userId, succeeded, reason });
}

/**
 * Fetch a Didit session's decision from Didit and apply it. `expectedUserId`
 * is the signed-in user on the browser callback; the webhook omits it and
 * trusts the session's own `vendor_data` (which only our server can set).
 */
export async function applyDiditSession(
  sessionId: string,
  expectedUserId?: string
): Promise<DiditOutcome> {
  const decision = await getDiditDecision(sessionId);
  if (!decision) {
    return { state: 'pending', reason: 'Could not read the verification result yet. Try again shortly.' };
  }
  const userId = expectedUserId ?? decision.vendor_data;
  if (!userId || !/^[0-9a-f-]{36}$/i.test(userId)) {
    return { state: 'declined', reason: 'Unknown verification session.' };
  }

  const outcome = evaluateDecision(decision, userId);
  if (outcome.state === 'approved') {
    if (!(await markNidVerified(userId))) {
      return { state: 'pending', reason: 'Verified, but saving failed. Please try again.' };
    }
    await recordAttempt(userId, true, 'didit');
  } else if (outcome.state === 'declined') {
    await recordAttempt(userId, false, 'didit:declined');
  }
  return outcome;
}
