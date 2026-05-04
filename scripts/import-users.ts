/**
 * ─────────────────────────────────────────────────────────────
 *  AquaNet - User Import Script
 *  
 *  HOW TO USE:
 *  1. Edit scripts/users.json to add/change users
 *  2. Run: npx tsx scripts/import-users.ts
 *
 *  For MongoDB Atlas (online), run:
 *  $env:MONGODB_URI='your-atlas-uri'; npx tsx scripts/import-users.ts
 * ─────────────────────────────────────────────────────────────
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ── Load MongoDB URI ──────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aquanet';

// ── User Schema (inline to avoid import issues) ───────────────
const UserSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },
  role:      { type: String, default: 'Team Member' },
  initial:   { type: String },
  gradient:  { type: String, default: 'from-green-500 to-emerald-600' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// ── Load users.json ───────────────────────────────────────────
interface UserEntry {
  name: string;
  email: string;
  password: string;
  role?: string;
  initial?: string;
  gradient?: string;
}

const usersFilePath = resolve(process.cwd(), 'scripts/users.json');
const usersData: UserEntry[] = JSON.parse(readFileSync(usersFilePath, 'utf-8'));

// ── Main ──────────────────────────────────────────────────────
async function importUsers() {
  console.log('─────────────────────────────────────────');
  console.log('  AquaNet User Import Script');
  console.log('─────────────────────────────────────────\n');
  console.log(`📂 Loading users from: scripts/users.json`);
  console.log(`👥 Found ${usersData.length} user(s) to import\n`);
  console.log(`🔌 Connecting to: ${MONGODB_URI.replace(/:[^:@]+@/, ':****@')}\n`);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB!\n');

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const userData of usersData) {
      // Validate required fields
      if (!userData.name || !userData.email || !userData.password) {
        console.log(`⚠️  Skipping invalid entry (missing name/email/password):`, userData);
        skipped++;
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Check if user already exists
      const existing = await User.findOne({ email: userData.email.toLowerCase() });

      if (existing) {
        // Update existing user
        await User.updateOne(
          { email: userData.email.toLowerCase() },
          {
            name: userData.name,
            password: hashedPassword,
            role: userData.role || 'Team Member',
            initial: userData.initial || userData.name.charAt(0).toUpperCase(),
            gradient: userData.gradient || 'from-green-500 to-emerald-600',
          }
        );
        console.log(`🔄 Updated:  ${userData.name} (${userData.email})`);
        updated++;
      } else {
        // Create new user
        await User.create({
          name: userData.name,
          email: userData.email.toLowerCase(),
          password: hashedPassword,
          role: userData.role || 'Team Member',
          initial: userData.initial || userData.name.charAt(0).toUpperCase(),
          gradient: userData.gradient || 'from-green-500 to-emerald-600',
        });
        console.log(`✅ Created:  ${userData.name} (${userData.email})`);
        created++;
      }
    }

    console.log('\n─────────────────────────────────────────');
    console.log('  Import Summary');
    console.log('─────────────────────────────────────────');
    console.log(`  ✅ Created : ${created} user(s)`);
    console.log(`  🔄 Updated : ${updated} user(s)`);
    console.log(`  ⚠️  Skipped : ${skipped} user(s)`);
    console.log('─────────────────────────────────────────\n');

    console.log('🔑 Login credentials:');
    usersData.forEach(u => {
      console.log(`   📧 ${u.email.padEnd(30)} 🔒 ${u.password}`);
    });

    console.log('\n✨ Done!\n');
    await mongoose.disconnect();
    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
      console.log('\n💡 Cannot connect to MongoDB.');
      console.log('   For local:  make sure MongoDB service is running');
      console.log('   For Atlas:  set MONGODB_URI environment variable');
      console.log('\n   Example:');
      console.log('   $env:MONGODB_URI=\'mongodb+srv://user:pass@cluster.mongodb.net/aquanet\'');
      console.log('   npx tsx scripts/import-users.ts');
    }
    process.exit(1);
  }
}

importUsers();
