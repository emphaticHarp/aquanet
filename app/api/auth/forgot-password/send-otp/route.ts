import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendOTPEmail } from '@/lib/email';

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If this email is registered, you will receive an OTP shortly',
      });
    }

    // Generate OTP and set expiry (10 minutes)
    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP to user
    user.resetOTP = otp;
    user.resetOTPExpiry = expiry;
    await user.save();

    // Send OTP email
    await sendOTPEmail(user.email, otp, user.name);

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email address',
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}
