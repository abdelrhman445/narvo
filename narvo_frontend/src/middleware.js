import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(request) {
    const { pathname } = request.nextUrl;
    
    // ─── حماية لوحة التحكم (Admin Guard) ──────────────────────────────────
    const adminPaths = ['/dashboard', '/orders', '/finance', '/marketing', '/products'];
    const isDefinitelyAdmin = adminPaths.some((p) => pathname.startsWith(p));

    if (isDefinitelyAdmin) {
      const adminToken = request.cookies.get('AdminToken')?.value;

      // لو مش معاه توكن أدمن، ارجع للرئيسية
      if (!adminToken) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // حماية صفحة الدفع 
        if (pathname.startsWith("/checkout")) {
          return !!token; 
        }

        return true; 
      },
    },
    // ❌ مسحنا أوبشن الـ pages من هنا نهائياً عشان هو سبب اللوب
  }
);

export const config = {
  matcher: [
    '/checkout/:path*',
    '/dashboard/:path*',
    '/orders/:path*',
    '/finance/:path*',
    '/marketing/:path*',
    '/products/:path*',
  ],
};