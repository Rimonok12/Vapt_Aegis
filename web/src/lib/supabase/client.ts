'use client';

import { createBrowserClient } from '@supabase/ssr';

import type { Database } from '@/lib/database.types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/**
 * Browser client used only for auth flows (sign in / sign up / sign out) and
 * live session events. All tenant data is read on the server through RLS, so
 * this client is never used to query `reports` or `organizations`.
 */
export function createPublicClient() {
  return createBrowserClient<Database>(url, publishableKey);
}
