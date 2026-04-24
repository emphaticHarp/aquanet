import { connectDatabase } from '@/lib/db';
import User from '@/lib/models/user';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limiter: ip -> { count, resetAt }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60_000; // 1 minute

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true };
}

export async function POST(request: NextRequest) {
  try {
    // Server-side rate limiting
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      request.headers.get('x-real-ip') ??
      'unknown';

    const { allowed, retryAfter } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: `Too many login attempts. Try again in ${retryAfter}s.` },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    await connectDatabase();

    const { email, password, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Account not found' },
        { status: 401 }
      );
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not configured');

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      secret,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: { id: user._id.toString(), email: user.email, role: user.role },
      },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred during login',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
