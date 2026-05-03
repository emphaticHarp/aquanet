import { NextRequest, NextResponse } from 'next/server';

const PROTECTED = ['/dashboard'];
const PUBLIC_ONLY = ['/'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isPublicOnly = PUBLIC_ONLY.includes(pathname);

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isPublicOnly && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Exclude static files, images, api routes, and always-public auth pages
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|forgot-password).*)',
  ],
};
