/** Shared helpers/types for auth server actions (safe to import from client). */

export type AuthActionState = {
  status: 'idle' | 'error' | 'success';
  message?: string;
};

type AuthErrorLike = { message: string };

/** Map Supabase auth error messages to friendlier copy. */
export function rethrowAuthError(error: AuthErrorLike): string {
  const message = error.message.toLowerCase();

  if (message.includes('invalid login credentials')) {
    return 'Incorrect email or password.';
  }
  if (message.includes('email not confirmed')) {
    return 'Confirm your email address before signing in.';
  }
  if (message.includes('already registered') || message.includes('already exists')) {
    return 'An account with this email already exists.';
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Too many attempts. Please wait a minute and try again.';
  }
  return error.message;
}
