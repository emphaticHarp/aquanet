import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOTPEmail(email: string, otp: string, name: string) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'AquaNet <noreply@aquanet.com>',
    to: email,
    subject: 'AquaNet - Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">AquaNet</h1>
          <p style="color: #d1fae5; margin: 8px 0 0;">Password Reset Request</p>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
          <p style="color: #374151; font-size: 16px;">Hello <strong>${name}</strong>,</p>
          <p style="color: #6b7280;">We received a request to reset your AquaNet password. Use the OTP below:</p>
          <div style="background: white; border: 2px dashed #10b981; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
            <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px;">Your One-Time Password</p>
            <h2 style="color: #059669; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: monospace;">${otp}</h2>
            <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0;">Valid for 10 minutes</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            Powered by <strong>Megabotics</strong> — Mega Ideas, Mega Impact
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
