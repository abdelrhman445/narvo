import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Next.js Middleware — Route Guard
 *
 * Runs on every matched request BEFORE it reaches the page.
 *
 * Rules:
 * 1. Checkout routes → require valid NextAuth session (Google login)
 *    If missing → redirect to /api/auth/signin (Google OAuth flow)
 *
 * 2. Admin routes → require AdminToken cookie
 *    If missing → redirect to "/" silently (no admin route discovery)
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // ─── 1. Checkout Guard ─────────────────────────────────────────────────────
  if (pathname.startsWith('/checkout')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const signInUrl = new URL('/api/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // ─── 2. Admin Guard ────────────────────────────────────────────────────────
  const isAdminRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/products') && pathname.includes('/admin') ||
    pathname.startsWith('/orders') && pathname.includes('/admin') ||
    pathname.startsWith('/finance') ||
    pathname.startsWith('/marketing') ||
    // Match the (admin) route group paths
    pathname === '/dashboard' ||
    ['/dashboard', '/products', '/orders', '/finance', '/marketing'].some(
      (seg) => pathname.startsWith(seg)
    );

  // More reliable check: match the actual URL segments used in the app
  const adminPaths = ['/dashboard', '/orders', '/finance', '/marketing'];
  const isDefinitelyAdmin = adminPaths.some((p) => pathname.startsWith(p));

  if (isDefinitelyAdmin) {
    const adminToken = request.cookies.get('AdminToken');

    if (!adminToken?.value) {
      // Silent redirect to home — do NOT expose the admin login route
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/checkout/:path*',
    '/dashboard/:path*',
    '/orders/:path*',
    '/finance/:path*',
    '/marketing/:path*',
  ],
};
