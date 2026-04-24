import { connectDatabase } from '@/lib/db';
import User from '@/lib/models/user';
import { sendAdminPasswordChangeAlert } from '@/lib/mailer';
import bcryptjs from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await connectDatabase();

    const { email, otp, password } = await request.json();

    if (!email || !otp || !password) {
      return NextResponse.json(
        { success: false, message: 'Email, OTP, and new password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email }).select('+resetOtp +resetOtpExpires +password');

    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      return NextResponse.json(
        { success: false, message: 'OTP is invalid or has expired.' },
        { status: 400 }
      );
    }

    if (new Date() > user.resetOtpExpires) {
      return NextResponse.json(
        { success: false, message: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    if (user.resetOtp !== otp) {
      return NextResponse.json(
        { success: false, message: 'Incorrect OTP. Please try again.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    user.password = hashedPassword;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    console.log('✅ Password reset successfully for:', email);

    // Notify admin in background — don't await so it doesn't block response
    sendAdminPasswordChangeAlert(user.email).catch((err) => {
      console.error('⚠️ Failed to send admin alert (non-blocking):', err.message);
    });

    return NextResponse.json(
      { success: true, message: 'Password reset successfully. You can now log in.' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Reset password error:', error.message);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to reset password. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
