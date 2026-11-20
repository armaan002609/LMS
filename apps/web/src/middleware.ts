import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const roleCookie = request.cookies.get('dss_role')?.value;

  // 1. If visiting root and not authenticated -> redirect directly to /login
  if (pathname === '/') {
    if (!roleCookie) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Protect Admin Console
  if (pathname.startsWith('/admin')) {
    if (!roleCookie || roleCookie !== 'admin') {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();
  response.headers.set('x-tenant-slug', 'darkspace');
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|logo-mark.png|logo-text.png|images).*)'],
};
