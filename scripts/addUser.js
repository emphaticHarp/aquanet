const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const dns = require('dns');
require('dotenv').config({ path: '.env.local' });

// Configure DNS
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

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
    },
    role: {
      type: String,
      enum: ['member', 'admin', 'researcher'],
      default: 'member',
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

async function addUser(email, password, role = 'member') {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB');

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`⚠️ User already exists: ${email}`);
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

    console.log(`✅ User created successfully:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID: ${user._id}`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Get arguments from command line
const email = process.argv[2];
const password = process.argv[3];
const role = process.argv[4] || 'member';

if (!email || !password) {
  console.error('❌ Usage: node scripts/addUser.js <email> <password> [role]');
  console.error('   Example: node scripts/addUser.js user@example.com mypassword member');
  process.exit(1);
}

console.log(`\n📝 Adding user with:`);
console.log(`   Email: ${email}`);
console.log(`   Role: ${role}\n`);

addUser(email, password, role);
