'use server';

import { redirect } from 'next/navigation';
import { env } from '@/lib/env';
import { ensureProfile } from '@/lib/auth/ensure-profile';
import { rethrowAuthError, type AuthActionState } from '@/lib/auth/shared';
import { createAdminClient } from '@/lib/supabase/admin';
import { createAuthClient } from '@/lib/supabase/server';

/** Where Supabase should send users after they click the confirmation link. */
function confirmRedirectTo(): string {
  return `${env().appUrl}/api/auth/callback?next=/verify`;
}

export async function signInWithPassword(
  _previous: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/dashboard');

  if (!email || !password) {
    return { status: 'error', message: 'Email and password are required.' };
  }

  const supabase = await createAuthClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // "Invalid login credentials" covers both wrong password and unknown
    // email; distinguish the two so newcomers get pointed at sign-up.
    if (/invalid login credentials/i.test(error.message) && !(await accountExists(email))) {
      return {
        status: 'error',
        message: 'No account found for that email address. Please sign up first.',
      };
    }
    return { status: 'error', message: rethrowAuthError(error) };
  }

  // First request after the trigger-less signup may still need its rows created.
  if (data.user) await ensureProfile(data.user);

  // The proxy refreshes the session cookie on the next request.
  redirect(safeRedirect(next));
}

export async function signUpWithPassword(
  _previous: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');
  const fullName = String(formData.get('fullName') ?? '').trim();
  const organizationName = String(formData.get('organizationName') ?? '').trim();

  if (!email || !password || !fullName) {
    return { status: 'error', message: 'All fields are required.' };
  }
  if (password.length < 8) {
    return { status: 'error', message: 'Password must be at least 8 characters.' };
  }

  const supabase = await createAuthClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, organization_name: organizationName || fullName },
      emailRedirectTo: confirmRedirectTo(),
    },
  });
  if (error) return { status: 'error', message: rethrowAuthError(error) };

  // When email confirmation is disabled Supabase signs the user straight in.
  if (data.user && data.session) {
    await ensureProfile(data.user);
    redirect('/verify?signup=1');
  }

  // Email confirmation required: continue on the sign-in page, which shows
  // the "check your inbox" notice.
  redirect('/signin?registered=1');
}

export async function signOut(): Promise<void> {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  redirect('/signin');
}

/** Re-send the confirmation email when the previous link expired. */
export async function resendConfirmation(
  _previous: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  if (!email) return { status: 'error', message: 'Enter your email address first.' };

  const supabase = await createAuthClient();
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: confirmRedirectTo() },
  });
  if (error) return { status: 'error', message: rethrowAuthError(error) };

  return {
    status: 'success',
    message: 'A fresh confirmation link is on its way. It stays valid for one hour.',
  };
}

/** Email the user a one-time password-reset link. */
export async function requestPasswordReset(
  _previous: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  if (!email) return { status: 'error', message: 'Enter your email address first.' };

  const supabase = await createAuthClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${env().appUrl}/api/auth/callback?next=/reset-password`,
  });
  if (error) return { status: 'error', message: rethrowAuthError(error) };

  return {
    status: 'success',
    message:
      'If an account exists for that address, a password-reset link is on its way. Check your inbox.',
  };
}

/** Set a new password after following a reset link (session already exchanged). */
export async function updatePassword(
  _previous: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirmPassword') ?? '');

  if (password.length < 8) {
    return { status: 'error', message: 'Password must be at least 8 characters.' };
  }
  if (password !== confirm) {
    return { status: 'error', message: 'Passwords do not match.' };
  }

  const supabase = await createAuthClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { status: 'error', message: rethrowAuthError(error) };

  return { status: 'success', message: 'Password updated. Taking you in…' };
}

/** Only allow same-origin relative paths as post-auth redirects. */
function safeRedirect(value: string): string {
  return value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard';
}

/** Privileged lookup: does an auth user exist for this email? */
async function accountExists(email: string): Promise<boolean> {
  const admin = createAdminClient();
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data?.users?.length) return false;
    if (data.users.some((user) => (user.email ?? '').toLowerCase() === email)) return true;
    if (data.users.length < 200) return false;
    page += 1;
  }
}
