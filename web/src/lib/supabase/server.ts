import 'server-only';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

import { env } from '@/lib/env';
import type { Database } from '@/lib/database.types';

/**
 * Per-request Supabase client for Server Components, Server Actions and Route
 * Handlers. It reads the session from request cookies and uses Row-Level
 * Security: the caller can only ever see rows their policy allows.
 *
 * Cookies can only be *written* from a Server Action or Route Handler. When
 * this client is used inside a Server Component the write throws, which is
 * fine: `src/proxy.ts` refreshes and re-persists the session before rendering.
 */
export async function createAuthClient() {
  const { supabaseUrl, publishableKey } = env();
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component render: the proxy keeps cookies up to date.
        }
      },
    },
  });
}
