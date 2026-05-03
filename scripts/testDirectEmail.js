const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testDirectEmail() {
  try {
    console.log('🔧 Testing direct email sending...\n');
    
    console.log('📋 Configuration:');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('SMTP_FROM:', process.env.SMTP_FROM);
    console.log('SMTP_PASS length:', process.env.SMTP_PASS?.length, '\n');

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: parseInt(process.env.SMTP_PORT || '587') === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log('🔌 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified\n');

    const otp = '123456';
    const testEmail = process.env.SMTP_USER;

    console.log('📧 Sending test OTP email...');
    console.log('To:', testEmail);
    console.log('OTP:', otp, '\n');

    const result = await transporter.sendMail({
      from: `"Aquanet" <${process.env.SMTP_FROM}>`,
      to: testEmail,
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
    console.log('\n✅ Email configuration is working correctly!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error details:');
    console.error(error);
    process.exit(1);
  }
}

testDirectEmail();
