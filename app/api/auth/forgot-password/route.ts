import { connectDatabase } from '@/lib/db';
import User from '@/lib/models/user';
import { sendOtpEmail } from '@/lib/mailer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let email = '';
  try {
    console.log('📧 [Forgot Password] Request received');
    
    await connectDatabase();
    console.log('✅ [Forgot Password] Database connected');

    const body = await request.json();
    email = body.email;
    console.log('📧 [Forgot Password] Email requested:', email);

    if (!email) {
      console.log('❌ [Forgot Password] Email is required');
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email }).select('+resetOtp +resetOtpExpires');
    console.log('🔍 [Forgot Password] User lookup result:', user ? 'Found' : 'Not found');

    // Check if user exists
    if (!user) {
      console.log('⚠️ [Forgot Password] User not found for email:', email);
      return NextResponse.json(
        { success: false, message: 'No account found with this email address' },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔐 [Forgot Password] Generated OTP:', otp);

    user.resetOtp = otp;
    user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save({ validateBeforeSave: false });
    console.log('💾 [Forgot Password] OTP saved to database');

    try {
      console.log('📨 [Forgot Password] Attempting to send email to:', user.email);
      const emailResult = await sendOtpEmail(user.email, otp);
      console.log('✅ [Forgot Password] OTP email sent successfully:', emailResult.messageId);
    } catch (emailError: any) {
      console.error('❌ [Forgot Password] Email sending failed');
      console.error('   Error message:', emailError.message);
      console.error('   Error code:', emailError.code);
      console.error('   Full error:', emailError);
      
      // Clear the OTP since email failed
      user.resetOtp = undefined;
      user.resetOtpExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to send OTP email. Please try again later.',
          error: process.env.NODE_ENV === 'development' ? emailError.message : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'OTP sent to your email. Check your inbox.' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ [Forgot Password] Unexpected error');
    console.error('   Error message:', error.message);
    console.error('   Error code:', error.code);
    console.error('   Full error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
