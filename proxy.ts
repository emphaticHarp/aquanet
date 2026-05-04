import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PROTECTED = ['/dashboard'];
const PUBLIC_ONLY = ['/login'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isPublicOnly = PUBLIC_ONLY.some((p) => pathname.startsWith(p));

  // Verify token validity using jose (works in Edge runtime)
  let isValidToken = false;
  if (token) {
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'aquanet_jwt_secret_key_2024'
      );
      await jwtVerify(token, secret);
      isValidToken = true;
    } catch {
      isValidToken = false;
    }
  }

  // Redirect to login if trying to access protected route without valid token
  if (isProtected && !isValidToken) {
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    // Clear invalid/expired token cookie
    response.cookies.delete('token');
    return response;
  }

  // Redirect to dashboard if already logged in and trying to access login
  if (isPublicOnly && isValidToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png|uploads).*)',
  ],
};
