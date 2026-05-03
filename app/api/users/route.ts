import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Connection from '@/models/Connection';
import jwt from 'jsonwebtoken';

function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string; name: string };
  } catch {
    return null;
  }
}

// GET - Get all users (for team members list)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = verifyToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all users except current user
    const users = await User.find({ _id: { $ne: user.userId } })
      .select('name email createdAt')
      .lean();

    // Get connection status for each user
    const usersWithStatus = await Promise.all(
      users.map(async (otherUser) => {
        const connection = await Connection.findOne({
          $or: [
            { requester: user.userId, recipient: otherUser._id },
            { requester: otherUser._id, recipient: user.userId },
          ],
        });

        return {
          id: otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
          initial: otherUser.name.charAt(0).toUpperCase(),
          role: 'Team Member', // You can add role field to User model
          connectionStatus: connection ? connection.status : 'none',
          gradient: `from-${['teal', 'pink', 'violet', 'orange', 'blue'][Math.floor(Math.random() * 5)]}-500 to-${['cyan', 'rose', 'purple', 'amber', 'indigo'][Math.floor(Math.random() * 5)]}-600`,
        };
      })
    );

    return NextResponse.json({
      success: true,
      users: usersWithStatus,
    });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
