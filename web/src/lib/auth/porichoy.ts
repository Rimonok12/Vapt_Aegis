import 'server-only';

import { env, isProd } from '@/lib/env';

export type PorichoyResult =
  | { ok: true; name?: string }
  | { ok: false; code: number; message: string };

/**
 * Verify a National ID + date of birth against the Porichoy gateway.
 *
 * The raw NID is only ever held in memory for the duration of this call — it is
 * never written to the database, logs, or cookies. On success we flip
 * `profiles.nid_verified` and stop here.
 *
 * API shape (documented): POST {base}/verify
 *   body:    { nid, year, month, date }
 *   header:  Authorization: Bearer <key>
 *   200:     { status, message, data: { ... } }
 */
export async function verifyNationalId(
  nid: string,
  dob: { year: number; month: number; date: number }
): Promise<PorichoyResult> {
  const { porichoyUrl, porichoyKey, porichoyMock } = env();

  if (!porichoyKey) {
    // Mock mode (see .env.example): the input has already passed nidSchema, so
    // any well-formed NID + DOB is accepted. On by default in development; a
    // production deploy must opt in explicitly with PORICHOY_MOCK=true so it
    // never silently skips identity checks.
    if (!isProd() || porichoyMock) return { ok: true };
    return { ok: false, code: 503, message: 'Verification service is not configured yet.' };
  }

  let response: Response;
  try {
    response = await fetch(`${porichoyUrl}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${porichoyKey}`,
      },
      body: JSON.stringify({ nid, ...dob }),
      // Never cache; short timeout so a slow gateway cannot hang the request.
      cache: 'no-store',
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    return { ok: false, code: 502, message: 'Could not reach the verification service.' };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return {
      ok: false,
      code: response.status || 502,
      message: 'Unexpected response from gateway.',
    };
  }

  const record = (payload ?? {}) as Record<string, unknown>;
  const status = String(record.status ?? '').toLowerCase();
  const message =
    typeof record.message === 'string' ? record.message : 'National ID could not be verified.';

  // Porichoy returns HTTP 200 with a status field; treat only explicit success as pass.
  const success =
    response.ok &&
    (status === 'success' || status === 'verified' || status === 'true' || record.status === true);

  if (!success) {
    return { ok: false, code: response.status, message };
  }

  const data = (record.data ?? {}) as Record<string, unknown>;
  const name =
    typeof data.name === 'string'
      ? data.name
      : typeof data.name_en === 'string'
        ? data.name_en
        : undefined;

  return { ok: true, name };
}
