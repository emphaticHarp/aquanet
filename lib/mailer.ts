import nodemailer from 'nodemailer';

let transporter: any = null;

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('SMTP_HOST, SMTP_USER, and SMTP_PASS must be set in environment variables');
  }

  console.log('🔧 [Mailer] Creating transporter with:');
  console.log('   Host:', host);
  console.log('   Port:', port);
  console.log('   User:', user);
  console.log('   Secure:', port === 465);

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 10000,
    socketTimeout: 10000,
  });
}

export async function sendOtpEmail(to: string, otp: string) {
  try {
    console.log('📧 [Mailer] sendOtpEmail called');
    console.log('   To:', to);
    console.log('   OTP:', otp);
    
    const transporter = createTransporter();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;

    console.log('📧 [Mailer] Sending OTP email from:', from);
    
    const mailOptions = {
      from: `"Aquanet" <${from}>`,
      to,
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
    };

    console.log('📧 [Mailer] Mail options prepared');
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ [Mailer] OTP email sent successfully');
    console.log('   Message ID:', result.messageId);
    return result;
  } catch (error: any) {
    console.error('❌ [Mailer] Failed to send OTP email');
    console.error('   Error message:', error.message);
    console.error('   Error code:', error.code);
    console.error('   Error response:', error.response);
    console.error('   Full error:', JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function sendAdminPasswordChangeAlert(userEmail: string) {
  try {
    console.log('📧 [Mailer] sendAdminPasswordChangeAlert called');
    console.log('   User Email:', userEmail);
    
    const transporter = createTransporter();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      console.log('⚠️ [Mailer] ADMIN_EMAIL not configured, skipping alert');
      return;
    }

    console.log('📧 [Mailer] Sending admin alert to:', adminEmail);

    const mailOptions = {
      from: `"Aquanet Security" <${from}>`,
      to: adminEmail,
      subject: '⚠️ Password changed — Aquanet user alert',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#dc2626;">Security Alert</h2>
          <p>A password reset was completed for the following account:</p>
          <p style="font-size:16px;font-weight:600;color:#111827;">${userEmail}</p>
          <p style="color:#6b7280;font-size:13px;">Time: ${new Date().toUTCString()}</p>
          <p style="color:#6b7280;font-size:13px;">If this was not expected, please investigate immediately.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
          <p style="color:#9ca3af;font-size:12px;">Aquanet · Powered by MegaBotics</p>
        </div>
      `,
    };

    console.log('📧 [Mailer] Mail options prepared');
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ [Mailer] Admin alert sent successfully');
    console.log('   Message ID:', result.messageId);
    return result;
  } catch (error: any) {
    console.error('❌ [Mailer] Failed to send admin alert');
    console.error('   Error message:', error.message);
    console.error('   Error code:', error.code);
    console.error('   Full error:', JSON.stringify(error, null, 2));
    throw error;
  }
}
