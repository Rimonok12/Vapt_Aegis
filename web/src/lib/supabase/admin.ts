import 'server-only';

import { createClient } from '@supabase/supabase-js';

import { env } from '@/lib/env';
import type { Database } from '@/lib/database.types';

/**
 * Privileged client built with the Supabase secret key. It bypasses Row-Level
 * Security, so it must never be reachable from a Client Component or returned
 * to the browser. Only these server paths may use it:
 *
 *   - the NID verification route handler (writes `nid_verified`)
 *   - the admin upload proxy (creates/updates `reports`)
 *
 * A module-level singleton is safe here: it holds no user state, only keys.
 */
let cached: ReturnType<typeof createClient<Database>> | null = null;

export function createAdminClient() {
  if (cached) return cached;
  const { supabaseUrl, secretKey } = env();
  cached = createClient<Database>(supabaseUrl, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      storageKey: 'aegis-admin',
    },
    global: {
      headers: { 'x-application-name': 'aegis-compliance-portal' },
    },
  });
  return cached;
}
