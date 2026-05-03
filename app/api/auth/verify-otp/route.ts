import { connectDatabase } from '@/lib/db';
import User from '@/lib/models/user';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📧 [Verify OTP] Request received');
    
    await connectDatabase();
    console.log('✅ [Verify OTP] Database connected');

    const { email, otp } = await request.json();
    console.log('📧 [Verify OTP] Email:', email, 'OTP:', otp);

    if (!email || !otp) {
      console.log('❌ [Verify OTP] Email and OTP are required');
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email }).select('+resetOtp +resetOtpExpires');
    console.log('🔍 [Verify OTP] User lookup result:', user ? 'Found' : 'Not found');

    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      console.log('❌ [Verify OTP] OTP not found or expired');
      return NextResponse.json(
        { success: false, message: 'OTP is invalid or has expired.' },
        { status: 400 }
      );
    }

    if (new Date() > user.resetOtpExpires) {
      console.log('❌ [Verify OTP] OTP has expired');
      return NextResponse.json(
        { success: false, message: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    if (user.resetOtp !== otp) {
      console.log('❌ [Verify OTP] OTP does not match');
      return NextResponse.json(
        { success: false, message: 'Incorrect OTP. Please try again.' },
        { status: 400 }
      );
    }

    console.log('✅ [Verify OTP] OTP verified successfully');
    return NextResponse.json(
      { success: true, message: 'OTP verified successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ [Verify OTP] Error:', error.message);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to verify OTP. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
