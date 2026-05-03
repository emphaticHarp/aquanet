import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';

// Use the exact same key
const ENCRYPTION_KEY = 'aquanet_secure_messaging_encryption_key_2024';

function decryptMessage(encryptedMessage: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedMessage, ENCRYPTION_KEY);
    const originalText = decrypted.toString(CryptoJS.enc.Utf8);
    
    // If decryption returns empty string, it means decryption failed
    if (!originalText || originalText.length === 0) {
      console.error('⚠️ Decryption returned empty for:', encryptedMessage.substring(0, 30));
      return '[Unable to decrypt message]';
    }
    
    return originalText;
  } catch (error) {
    console.error('❌ Decryption error:', error);
    return '[Unable to decrypt message]';
  }
}

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

// GET - Get all conversations for the current user
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
      .select('name email')
      .lean();

    // Get unread counts for each conversation
    const conversations = await Promise.all(
      users.map(async (otherUser) => {
        const conversationId = [user.userId, otherUser._id.toString()]
          .sort()
          .join('_');

        // Get last message
        const lastMessage = await Message.findOne({ conversationId })
          .sort({ createdAt: -1 })
          .lean();

        // Get unread count
        const unreadCount = await Message.countDocuments({
          conversationId,
          receiver: user.userId,
          read: false,
        });

        return {
          id: otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
          initial: otherUser.name.charAt(0).toUpperCase(),
          online: false, // You can implement online status with WebSockets
          unread: unreadCount,
          lastMessage: lastMessage
            ? {
                text: lastMessage.text ? decryptMessage(lastMessage.text) : (lastMessage.mediaType === 'image' ? '📷 Image' : lastMessage.mediaType === 'video' ? '🎥 Video' : '📎 File'),
                time: lastMessage.createdAt,
              }
            : null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error('Fetch conversations error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
