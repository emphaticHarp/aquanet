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

async function testOTP() {
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

    // Test 1: Generate OTP
    console.log('📝 Test 1: Generate OTP');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otp);
    console.log('OTP Length:', otp.length);
    console.log('Is 6 digits:', otp.length === 6 ? '✅ Yes' : '❌ No\n');

    // Test 2: OTP expiration
    console.log('\n⏱️ Test 2: OTP Expiration');
    const now = new Date();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    console.log('Current time:', now.toISOString());
    console.log('Expires at:', expiresAt.toISOString());
    console.log('Expires in:', Math.round((expiresAt - now) / 1000), 'seconds');
    console.log('Is valid:', now < expiresAt ? '✅ Yes' : '❌ No\n');

    // Test 3: Update user with OTP
    console.log('🔄 Test 3: Update user with OTP');
    const user = await User.findOne({ email: 'test@example.com' }).select('+resetOtp +resetOtpExpires');
    if (!user) {
      console.log('❌ Test user not found');
      await mongoose.disconnect();
      return;
    }

    user.resetOtp = otp;
    user.resetOtpExpires = expiresAt;
    await user.save({ validateBeforeSave: false });
    console.log('✅ User updated with OTP');
    console.log('Email:', user.email);
    console.log('OTP stored:', user.resetOtp);
    console.log('Expires at:', user.resetOtpExpires.toISOString(), '\n');

    // Test 4: Verify OTP
    console.log('✔️ Test 4: Verify OTP');
    const updatedUser = await User.findOne({ email: 'test@example.com' }).select('+resetOtp +resetOtpExpires');
    
    if (!updatedUser.resetOtp) {
      console.log('❌ OTP not found');
      await mongoose.disconnect();
      return;
    }

    if (new Date() > updatedUser.resetOtpExpires) {
      console.log('❌ OTP has expired');
      await mongoose.disconnect();
      return;
    }

    if (updatedUser.resetOtp === otp) {
      console.log('✅ OTP matches');
    } else {
      console.log('❌ OTP does not match');
      await mongoose.disconnect();
      return;
    }

    // Test 5: Clear OTP after use
    console.log('\n🗑️ Test 5: Clear OTP after use');
    updatedUser.resetOtp = undefined;
    updatedUser.resetOtpExpires = undefined;
    await updatedUser.save({ validateBeforeSave: false });
    console.log('✅ OTP cleared from user\n');

    // Test 6: Verify OTP is cleared
    console.log('🔍 Test 6: Verify OTP is cleared');
    const finalUser = await User.findOne({ email: 'test@example.com' }).select('+resetOtp +resetOtpExpires');
    if (!finalUser.resetOtp && !finalUser.resetOtpExpires) {
      console.log('✅ OTP successfully cleared\n');
    } else {
      console.log('❌ OTP still exists\n');
    }

    console.log('✅ All OTP tests passed!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testOTP();
