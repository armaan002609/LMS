import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const domain = host.split(':')[0] || '';

  let tenantSlug = 'acme'; // default demo fallback

  if (domain.endsWith('.lmsportal.app')) {
    tenantSlug = domain.replace('.lmsportal.app', '');
  }

  const response = NextResponse.next();
  response.headers.set('x-tenant-slug', tenantSlug);
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
