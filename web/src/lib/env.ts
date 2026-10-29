/**
 * Server-only environment configuration.
 *
 * Every access is validated once and cached, so a missing variable produces a
 * clear startup error instead of a mysterious runtime failure half-way through
 * a request. Never import this file from a Client Component.
 */

type Env = {
  supabaseUrl: string;
  publishableKey: string;
  secretKey: string;
  backendUrl: string;
  backendToken: string;
  porichoyUrl: string;
  porichoyKey: string;
  appUrl: string;
  bootstrapAdminEmail: string;
  nodeEnv: string;
};

let cached: Env | null = null;

function required(name: string, value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(`Missing required environment variable "${name}". Add it to .env.local.`);
  }
  return trimmed.replace(/\/+$/, '');
}

function optional(name: string, value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed.replace(/\/+$/, '') : fallback;
}

export function env(): Env {
  if (cached) return cached;
  cached = {
    supabaseUrl: required('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
    publishableKey: required(
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ),
    secretKey: required('SUPABASE_SECRET_KEY', process.env.SUPABASE_SECRET_KEY),
    backendUrl: optional('BACKEND_URL', process.env.BACKEND_URL, 'http://127.0.0.1:8000'),
    backendToken: optional('BACKEND_INTERNAL_TOKEN', process.env.BACKEND_INTERNAL_TOKEN, ''),
    porichoyUrl: optional(
      'PORICHOY_API_URL',
      process.env.PORICHOY_API_URL,
      'https://porichoy-backend.porichoy.dev/api/v1'
    ),
    porichoyKey: optional('PORICHOY_API_KEY', process.env.PORICHOY_API_KEY, ''),
    appUrl: optional(
      'NEXT_PUBLIC_APP_URL',
      process.env.NEXT_PUBLIC_APP_URL,
      'http://localhost:3000'
    ),
    bootstrapAdminEmail: (process.env.BOOTSTRAP_ADMIN_EMAIL ?? '').trim().toLowerCase(),
    nodeEnv: process.env.NODE_ENV ?? 'development',
  };
  return cached;
}

export const isProd = () => process.env.NODE_ENV === 'production';
