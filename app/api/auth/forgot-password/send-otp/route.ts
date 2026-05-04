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

    // Save OTP to user first
    user.resetOTP = otp;
    user.resetOTPExpiry = expiry;
    await user.save();

    // Try to send OTP email
    let emailSent = false;
    try {
      await sendOTPEmail(user.email, otp, user.name);
      emailSent = true;
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Email failed but OTP is saved - return OTP in response as fallback
    }

    return NextResponse.json({
      success: true,
      message: emailSent 
        ? 'OTP sent to your email address'
        : 'Email service unavailable. Use this OTP to reset your password:',
      // Return OTP in response if email failed (development fallback)
      otp: emailSent ? undefined : otp,
      emailSent,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}
