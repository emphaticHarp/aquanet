const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
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

async function addUser() {
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

    // Get email and password from command line arguments
    const email = process.argv[2];
    const password = process.argv[3];
    const role = process.argv[4] || 'member';

    if (!email || !password) {
      console.log('❌ Usage: node scripts/addUserByEmail.js <email> <password> [role]');
      console.log('   Example: node scripts/addUserByEmail.js soumya@gmail.com mypassword123 member');
      await mongoose.disconnect();
      return;
    }

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('⚠️ User already exists with email:', email);
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      role,
    });

    console.log('✅ User created successfully:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${role}`);
    console.log(`   ID: ${user._id}`);
    console.log('\n✅ You can now use this email to login and test forgot password!');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addUser();
