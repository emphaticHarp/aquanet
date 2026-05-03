import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
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

// POST - Send connection request
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const user = verifyToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: recipientId } = await params;

    if (user.userId === recipientId) {
      return NextResponse.json(
        { success: false, message: 'Cannot connect with yourself' },
        { status: 400 }
      );
    }

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { requester: user.userId, recipient: recipientId },
        { requester: recipientId, recipient: user.userId },
      ],
    });

    if (existingConnection) {
      return NextResponse.json(
        { success: false, message: 'Connection already exists' },
        { status: 400 }
      );
    }

    const connection = await Connection.create({
      requester: user.userId,
      recipient: recipientId,
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      message: 'Connection request sent',
      connection,
    });
  } catch (error) {
    console.error('Send connection error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send connection request' },
      { status: 500 }
    );
  }
}
