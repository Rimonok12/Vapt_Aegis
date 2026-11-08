import { NextResponse, type NextRequest } from 'next/server';

import { verifyWebhookEnvelope } from '@/lib/auth/didit';
import { applyDiditSession } from '@/lib/auth/identity';

/**
 * Didit webhook: finishes verifications whose browser never came back (closed
 * tab, manual review approved later). Only the signed envelope is trusted —
 * the decision is re-fetched from Didit before anything is changed.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    session_id?: string;
    status?: string;
    webhook_type?: string;
  } | null;
  if (!body || !verifyWebhookEnvelope(request.headers, body)) {
    return NextResponse.json({ message: 'Invalid signature.' }, { status: 401 });
  }
  if (body.session_id) await applyDiditSession(body.session_id);
  return NextResponse.json({ ok: true });
}
