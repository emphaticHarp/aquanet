const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
  try {
    console.log('🔧 Testing SMTP configuration...');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('SMTP_FROM:', process.env.SMTP_FROM);
    console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: parseInt(process.env.SMTP_PORT || '587') === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      logger: true,
      debug: true,
    });

    console.log('\n📧 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');

    console.log('\n📧 Sending test email...');
    const result = await transporter.sendMail({
      from: `"Aquanet Test" <${process.env.SMTP_FROM}>`,
      to: process.env.SMTP_USER,
      subject: 'Aquanet Email Test',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#16a34a;">Email Configuration Test</h2>
          <p>If you received this email, your SMTP configuration is working correctly!</p>
          <p style="color:#6b7280;font-size:13px;">Sent at: ${new Date().toUTCString()}</p>
        </div>
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('\n✅ All SMTP settings are correct. Forgot password emails should work now.');
  } catch (error) {
    console.error('❌ SMTP Error:', error.message);
    console.error('\nCommon issues:');
    console.error('1. Gmail: Use App Password, not regular password');
    console.error('2. Check SMTP_PASS has no extra spaces');
    console.error('3. Verify SMTP_HOST and SMTP_PORT are correct');
    console.error('4. Check firewall/network allows SMTP connections');
    process.exit(1);
  }
}

testEmail();
