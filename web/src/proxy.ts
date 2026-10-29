import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/** Paths that must stay reachable without a session. */
const PUBLIC_ROUTES = [
  '/',
  '/signin',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/auth',
  '/api/auth',
  '/verify',
];

function isPublic(pathname: string): boolean {
  if (pathname === '/') return true;
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/**
 * Next 16 proxy (formerly `middleware`).
 *
 * Runs before rendering on every non-static request. Its only job is to keep
 * the Supabase session cookies fresh: an expired access token is refreshed and
 * the new tokens are written to the response. Without this, Server Components
 * (which cannot write cookies) would silently drop sessions.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          // Keep the forwarded request in sync with the refreshed tokens.
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Do not run the proxy against the Supabase auth endpoints themselves.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { pathname, search } = request.nextUrl;
  const searchParams = request.nextUrl.searchParams;

  // Supabase bounces failed/expired email links to the site root with error
  // params; forward them to the sign-in page so the user sees what happened.
  if (pathname === '/') {
    const errorCode = searchParams.get('error_code');
    const error = searchParams.get('error');
    if (errorCode || error) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/signin';
      redirectUrl.search = '';
      if (errorCode) redirectUrl.searchParams.set('error_code', errorCode);
      if (error) redirectUrl.searchParams.set('error', error);
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (!user && !isPublic(pathname)) {
    // API callers parse JSON; an HTML sign-in redirect would surface as a
    // confusing "network error" in the client forms.
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ message: 'Your session has expired. Please sign in again.' }, { status: 401 });
    }
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/signin';
    redirectUrl.search = '';
    if (pathname !== '/signin' && pathname !== '/signup') {
      redirectUrl.searchParams.set('next', `${pathname}${search}`);
    }
    return NextResponse.redirect(redirectUrl);
  }

  if (user && (pathname === '/signin' || pathname === '/signup')) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    redirectUrl.search = '';
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match everything except static assets, images and files with an extension.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|avf|avif)$).*)',
  ],
};
