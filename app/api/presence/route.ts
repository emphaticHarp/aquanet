import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// In-memory store for online users and typing status
// In production, use Redis or a database
const onlineUsers = new Map<string, number>(); // userId -> lastSeen timestamp
const typingStatus = new Map<string, { conversationId: string; timestamp: number }>(); // userId -> typing info

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

// Clean up stale data (users offline for more than 30 seconds)
function cleanupStaleData() {
  const now = Date.now();
  const OFFLINE_THRESHOLD = 30000; // 30 seconds
  const TYPING_THRESHOLD = 3000; // 3 seconds
  
  // Remove offline users
  for (const [userId, lastSeen] of onlineUsers.entries()) {
    if (now - lastSeen > OFFLINE_THRESHOLD) {
      onlineUsers.delete(userId);
    }
  }
  
  // Remove stale typing status
  for (const [userId, info] of typingStatus.entries()) {
    if (now - info.timestamp > TYPING_THRESHOLD) {
      typingStatus.delete(userId);
    }
  }
}

// POST - Update user presence (heartbeat)
export async function POST(req: NextRequest) {
  try {
    const user = verifyToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action, conversationId } = await req.json();

    if (action === 'heartbeat') {
      // Update user's last seen timestamp
      onlineUsers.set(user.userId, Date.now());
    } else if (action === 'typing') {
      // Update typing status
      if (conversationId) {
        typingStatus.set(user.userId, {
          conversationId,
          timestamp: Date.now(),
        });
      }
    } else if (action === 'stop-typing') {
      // Remove typing status
      typingStatus.delete(user.userId);
    }

    cleanupStaleData();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Presence update error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update presence' },
      { status: 500 }
    );
  }
}

// GET - Get online users and typing status
export async function GET(req: NextRequest) {
  try {
    const user = verifyToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    cleanupStaleData();

    // Get list of online user IDs
    const onlineUserIds = Array.from(onlineUsers.keys());

    // Check if someone is typing in this conversation
    let isTyping = false;
    if (conversationId) {
      for (const [userId, info] of typingStatus.entries()) {
        if (userId !== user.userId && info.conversationId === conversationId) {
          isTyping = true;
          break;
        }
      }
    }

    return NextResponse.json({
      success: true,
      onlineUsers: onlineUserIds,
      isTyping,
    });
  } catch (error) {
    console.error('Get presence error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get presence' },
      { status: 500 }
    );
  }
}
