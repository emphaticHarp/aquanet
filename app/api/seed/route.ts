import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// Secret key to protect this endpoint
const SEED_SECRET = process.env.SEED_SECRET || 'aquanet-seed-2024';

const USERS = [
  {
    name: 'Soumyajyoti Banik',
    email: 'soumya@aquanet.com',
    password: 'password123',
    role: 'Aquaculture Manager',
  },
  {
    name: 'Team Member 2',
    email: 'member2@aquanet.com',
    password: 'password123',
    role: 'Marine IoT Engineer',
  },
  {
    name: 'Team Member 3',
    email: 'member3@aquanet.com',
    password: 'password123',
    role: 'Data Analyst',
  },
  {
    name: 'Team Member 4',
    email: 'member4@aquanet.com',
    password: 'password123',
    role: 'Fisheries Researcher',
  },
  {
    name: 'Team Member 5',
    email: 'member5@aquanet.com',
    password: 'password123',
    role: 'Robot Fleet Manager',
  },
];

export async function POST(req: NextRequest) {
  try {
    // Check secret key
    const { secret } = await req.json();
    if (secret !== SEED_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const results = [];

    for (const userData of USERS) {
      const existing = await User.findOne({ email: userData.email });

      if (existing) {
        // Update password
        existing.password = userData.password;
        await existing.save(); // pre-save hook will hash it
        results.push({ email: userData.email, action: 'updated' });
      } else {
        // Create new user - pre-save hook will hash password
        await User.create(userData);
        results.push({ email: userData.email, action: 'created' });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      results,
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// GET - just check if endpoint is alive
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Seed endpoint ready. Send POST with { "secret": "aquanet-seed-2024" }',
  });
}
