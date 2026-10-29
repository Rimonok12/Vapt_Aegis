import 'server-only';

import { createDecipheriv } from 'node:crypto';

import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Admin-only per-asset map (migration 002). Host identifiers are AES-256-GCM
 * ciphertext written by the backend — format base64url(nonce[12] ||
 * ciphertext || tag[16]) — and are decrypted here, on the server, only after
 * the caller has been checked as an admin of the report's organisation.
 */

export type AssetHit = {
  label: string;
  host: string;
  port: string | null;
  protocol: string | null;
};

export type AssetMap = {
  /** finding id → hosts it affects */
  byFinding: Record<string, AssetHit[]>;
  /** one row per host */
  hosts: { label: string; host: string; findingIds: string[]; ports: string[] }[];
};

function key(): Buffer | null {
  const raw = process.env.ASSET_ENCRYPTION_KEY?.trim();
  if (!raw) return null;
  const buf = Buffer.from(raw, 'base64');
  return buf.length === 32 ? buf : null;
}

function decrypt(token: string, secret: Buffer): string {
  const blob = Buffer.from(token, 'base64url');
  const nonce = blob.subarray(0, 12);
  const tag = blob.subarray(blob.length - 16);
  const body = blob.subarray(12, blob.length - 16);
  const decipher = createDecipheriv('aes-256-gcm', secret, nonce);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(body), decipher.final()]).toString('utf8');
}

export function assetMapConfigured(): boolean {
  return key() !== null;
}

/** Null when the key is missing, the table doesn't exist yet, or nothing was stored. */
export async function getAssetMap(
  reportId: string,
  organizationId: string
): Promise<AssetMap | null> {
  const secret = key();
  if (!secret) return null;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('report_assets')
    .select('finding_id, label, host_enc, port, protocol')
    .eq('report_id', reportId)
    .eq('organization_id', organizationId)
    .order('label', { ascending: true })
    .limit(5000);
  if (error || !data || data.length === 0) return null;

  const byFinding: AssetMap['byFinding'] = {};
  const hosts = new Map<string, AssetMap['hosts'][number]>();
  const plain = new Map<string, string>();

  for (const row of data) {
    let host = plain.get(row.host_enc);
    if (host === undefined) {
      try {
        host = decrypt(row.host_enc, secret);
      } catch {
        host = '(cannot decrypt — key changed)';
      }
      plain.set(row.host_enc, host);
    }
    (byFinding[row.finding_id] ??= []).push({
      label: row.label,
      host,
      port: row.port,
      protocol: row.protocol,
    });
    const entry = hosts.get(row.label) ?? { label: row.label, host, findingIds: [], ports: [] };
    if (!entry.findingIds.includes(row.finding_id)) entry.findingIds.push(row.finding_id);
    if (row.port && !entry.ports.includes(row.port)) entry.ports.push(row.port);
    hosts.set(row.label, entry);
  }

  return { byFinding, hosts: [...hosts.values()] };
}
