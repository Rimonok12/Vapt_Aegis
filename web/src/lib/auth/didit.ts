import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';

import { env } from '@/lib/env';

/**
 * Didit identity verification (https://docs.didit.me).
 *
 * The user photographs their Bangladesh NID card and takes a live selfie on
 * Didit's hosted page. Didit checks the card is genuine, reads it, checks the
 * selfie is a live person and matches the card portrait. We then fetch the
 * decision server-to-server and only accept it when the card is a Bangladeshi
 * ID whose number and date of birth match what the user typed.
 *
 * The raw NID never leaves this server: Didit receives only a keyed hash of it
 * (in session metadata) and reads the number off the card itself.
 */

const API = 'https://verification.didit.me';

export function diditConfigured(): boolean {
  const { diditApiKey, diditWorkflowId } = env();
  return Boolean(diditApiKey && diditWorkflowId);
}

/** Keyed hash of the digits of an NID, so it can be compared without being stored. */
export function nidDigest(nid: string): string {
  return createHmac('sha256', `${env().secretKey}:nid`)
    .update(nid.replace(/\D/g, ''))
    .digest('hex');
}

export async function createDiditSession(input: {
  userId: string;
  nid: string;
  dateOfBirth: string;
  callback: string;
}): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  const { diditApiKey, diditWorkflowId } = env();
  let response: Response;
  try {
    response = await fetch(`${API}/v3/session/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': diditApiKey },
      body: JSON.stringify({
        workflow_id: diditWorkflowId,
        vendor_data: input.userId,
        callback: input.callback,
        metadata: { nid_digest: nidDigest(input.nid), date_of_birth: input.dateOfBirth },
        expected_details: {
          date_of_birth: input.dateOfBirth,
          id_country: 'BGD',
          expected_document_types: ['ID'],
        },
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return { ok: false, message: 'Could not reach the verification service.' };
  }
  const data = (await response.json().catch(() => null)) as { url?: string } | null;
  if (!response.ok || !data?.url) {
    return { ok: false, message: 'The verification service could not start a session.' };
  }
  return { ok: true, url: data.url };
}

type IdVerification = {
  status?: string;
  issuing_state?: string;
  document_number?: string | null;
  personal_number?: string | null;
  date_of_birth?: string | null;
};

type Decision = {
  session_id?: string;
  status?: string;
  vendor_data?: string;
  metadata?: { nid_digest?: string; date_of_birth?: string } | null;
  id_verifications?: IdVerification[] | null;
};

export async function getDiditDecision(sessionId: string): Promise<Decision | null> {
  if (!/^[0-9a-f-]{36}$/i.test(sessionId)) return null;
  try {
    const response = await fetch(`${API}/v3/session/${sessionId}/decision/`, {
      headers: { 'x-api-key': env().diditApiKey },
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) return null;
    return (await response.json()) as Decision;
  } catch {
    return null;
  }
}

export type DiditOutcome =
  | { state: 'approved' }
  | { state: 'review' | 'pending' | 'declined'; reason: string };

/** Decide whether a Didit decision proves the user's NID. Fails closed. */
export function evaluateDecision(decision: Decision, userId: string): DiditOutcome {
  if (decision.vendor_data !== userId) {
    return { state: 'declined', reason: 'This verification belongs to a different account.' };
  }
  const status = (decision.status ?? '').toLowerCase();
  if (status === 'in review') {
    return { state: 'review', reason: 'Your documents are being reviewed. This usually takes a few minutes.' };
  }
  if (['not started', 'in progress', 'awaiting user', 'resubmitted'].includes(status)) {
    return { state: 'pending', reason: 'The verification is not finished yet.' };
  }
  if (status !== 'approved') {
    return { state: 'declined', reason: 'Identity verification was declined. Please try again with your own NID card.' };
  }

  const card = decision.id_verifications?.find((item) => item.status?.toLowerCase() === 'approved');
  if (!card) return { state: 'declined', reason: 'No approved ID card was found in the verification.' };
  if ((card.issuing_state ?? '').toUpperCase() !== 'BGD') {
    return { state: 'declined', reason: 'Please use a Bangladesh National ID card.' };
  }

  const expected = decision.metadata?.nid_digest;
  const numbers = [card.document_number, card.personal_number].filter(
    (value): value is string => Boolean(value && value.replace(/\D/g, '').length >= 10)
  );
  if (!expected || !numbers.some((value) => safeEqual(nidDigest(value), expected))) {
    return { state: 'declined', reason: 'The NID number on the card does not match the number you entered.' };
  }
  const dob = decision.metadata?.date_of_birth;
  if (!dob || card.date_of_birth !== dob) {
    return { state: 'declined', reason: 'The date of birth on the card does not match the one you entered.' };
  }
  return { state: 'approved' };
}

/**
 * Webhook authenticity via X-Signature-Simple (HMAC over the envelope). The
 * envelope only tells us which session changed; the decision itself is always
 * re-fetched from Didit with our API key, so the body is never trusted.
 */
export function verifyWebhookEnvelope(
  headers: Headers,
  body: { session_id?: string; status?: string; webhook_type?: string }
): boolean {
  const secret = env().diditWebhookSecret;
  const timestamp = headers.get('x-timestamp') ?? '';
  if (!secret || !/^\d+$/.test(timestamp)) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const message = `${timestamp}:${body.session_id ?? ''}:${body.status ?? ''}:${body.webhook_type ?? ''}`;
  const expected = createHmac('sha256', secret).update(message).digest('hex');
  return ['x-signature-simple', 'x-signature-simple-previous'].some((name) => {
    const value = headers.get(name);
    return Boolean(value && safeEqual(value, expected));
  });
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
