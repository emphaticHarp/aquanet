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

async function createTestUser() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    // Force IPv4 DNS resolution (same as app)
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
    console.log('✅ Connected to MongoDB');

    // Check if user exists
    const existing = await User.findOne({ email: 'test@example.com' });
    if (existing) {
      console.log('⚠️ Test user already exists');
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash('password123', salt);

    // Create user
    const user = await User.create({
      email: 'test@example.com',
      password: hashedPassword,
      role: 'member',
    });

    console.log('✅ Test user created successfully:');
    console.log(`   Email: test@example.com`);
    console.log(`   Password: password123`);
    console.log(`   Role: member`);
    console.log(`   ID: ${user._id}`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestUser();
