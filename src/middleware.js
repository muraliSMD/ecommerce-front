
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // 1. Protection for Admin Routes
  if (pathname.startsWith('/admin')) {
    // Allow access to login page
    if (pathname === '/admin/login') {
        // If already logged in, redirect to dashboard
        if (token) {
             return NextResponse.redirect(new URL('/admin', request.url));
        }
        return NextResponse.next();
    }

    // specific check for /admin/dashboard or sub-routes
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 2. Protection for User Account Routes
  if (pathname.startsWith('/account')) {
    if (!token) {
        // Redirect to home or trigger login modal (via query param?)
        // For now, redirect to home with a query param that client can use to open modal
        const url = new URL('/', request.url);
        url.searchParams.set('login', 'true');
        return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
  ],
};
