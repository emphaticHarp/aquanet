const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['member', 'admin', 'researcher'],
      default: 'member',
    },
    resetOtp: String,
    resetOtpExpires: Date,
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

async function testForgotPasswordFlow() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    const dns = require('dns');
    dns.setDefaultResultOrder('ipv4first');
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

    await mongoose.connect(process.env.MONGODB_URI, {
      family: 4,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      w: 'majority',
    });
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Find user
    console.log('📧 Step 1: Finding user...');
    const user = await User.findOne({ email: 'test@example.com' }).select('+resetOtp +resetOtpExpires');
    if (!user) {
      console.log('❌ User not found');
      await mongoose.disconnect();
      return;
    }
    console.log('✅ User found:', user.email, '\n');

    // Step 2: Generate OTP
    console.log('🔐 Step 2: Generating OTP...');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('✅ OTP generated:', otp, '\n');

    // Step 3: Save OTP to user
    console.log('💾 Step 3: Saving OTP to database...');
    user.resetOtp = otp;
    user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    console.log('✅ OTP saved to database\n');

    // Step 4: Send email
    console.log('📨 Step 4: Sending OTP email...');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: parseInt(process.env.SMTP_PORT || '587') === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const result = await transporter.sendMail({
      from: `"Aquanet" <${process.env.SMTP_FROM}>`,
      to: user.email,
      subject: 'Your Aquanet password reset OTP',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#16a34a;">Password Reset OTP</h2>
          <p>Use the code below to reset your Aquanet password. It expires in <strong>10 minutes</strong>.</p>
          <div style="margin:24px 0;text-align:center;">
            <span style="display:inline-block;letter-spacing:12px;font-size:36px;font-weight:700;color:#111827;background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:16px 24px;">
              ${otp}
            </span>
          </div>
          <p style="color:#6b7280;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
          <p style="color:#9ca3af;font-size:12px;">Aquanet · Powered by MegaBotics</p>
        </div>
      `,
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('To:', user.email);
    console.log('OTP:', otp, '\n');

    console.log('✅ Full forgot password flow test completed!');
    console.log('\n📝 Summary:');
    console.log('1. User found: test@example.com');
    console.log('2. OTP generated:', otp);
    console.log('3. OTP saved to database');
    console.log('4. Email sent to:', user.email);
    console.log('\n✅ Check your email inbox for the OTP!');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testForgotPasswordFlow();
