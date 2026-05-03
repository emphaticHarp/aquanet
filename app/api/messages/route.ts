import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';

// Use the exact same key as in .env.local
const ENCRYPTION_KEY = 'aquanet_secure_messaging_encryption_key_2024';

function encryptMessage(message: string): string {
  return CryptoJS.AES.encrypt(message, ENCRYPTION_KEY).toString();
}

function decryptMessage(encryptedMessage: string): string {
  try {
    console.log('🔓 Attempting to decrypt:', encryptedMessage.substring(0, 30) + '...');
    console.log('🔑 Using key:', ENCRYPTION_KEY);
    
    const decrypted = CryptoJS.AES.decrypt(encryptedMessage, ENCRYPTION_KEY);
    const originalText = decrypted.toString(CryptoJS.enc.Utf8);
    
    console.log('📝 Decrypted result length:', originalText.length);
    console.log('📝 Decrypted text:', originalText || 'EMPTY STRING');
    
    // If decryption returns empty string, it means decryption failed
    if (!originalText || originalText.length === 0) {
      console.error('⚠️ Decryption returned empty - this message may be corrupted or use wrong key');
      // Return a placeholder instead of encrypted text
      return '[Message decryption failed]';
    }
    
    console.log('✅ Successfully decrypted message');
    return originalText;
  } catch (error) {
    console.error('❌ Decryption error:', error);
    return '[Message decryption failed]';
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

// GET - Get messages for a conversation
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

    const { searchParams } = new URL(req.url);
    const otherUserId = searchParams.get('userId');

    if (!otherUserId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    const conversationId = [user.userId, otherUserId].sort().join('_');

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .lean();

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        receiver: user.userId,
        read: false,
      },
      { read: true }
    );

    return NextResponse.json({
      success: true,
      messages: messages.map((msg) => ({
        id: msg._id,
        from: msg.sender.toString() === user.userId ? 'me' : 'them',
        text: msg.text ? decryptMessage(msg.text) : '', // Decrypt if text exists
        mediaUrl: msg.mediaUrl,
        mediaType: msg.mediaType,
        fileName: msg.fileName,
        fileSize: msg.fileSize,
        time: new Date(msg.createdAt).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
        createdAt: msg.createdAt,
        encrypted: true,
      })),
    });
  } catch (error) {
    console.error('Fetch messages error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Send a message
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = verifyToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { receiverId, receiverName, text, mediaUrl, mediaType, fileName, fileSize } = await req.json();

    console.log('📨 Sending message:', { receiverId, text, mediaUrl, mediaType, fileName, fileSize });

    // At least one of text or mediaUrl must be provided
    if (!receiverId || ((!text || text.trim().length === 0) && !mediaUrl)) {
      console.error('❌ Validation failed: missing receiverId or content');
      return NextResponse.json(
        { success: false, message: 'Receiver ID and text or media are required' },
        { status: 400 }
      );
    }

    // Get receiver details from database to ensure correct name
    const receiver = await User.findById(receiverId).select('name email');
    if (!receiver) {
      console.error('❌ Receiver not found:', receiverId);
      return NextResponse.json(
        { success: false, message: 'Receiver not found' },
        { status: 404 }
      );
    }

    const conversationId = [user.userId, receiverId].sort().join('_');

    // Encrypt the message text if provided
    const encryptedText = text && text.trim() ? encryptMessage(text.trim()) : '';

    console.log('💾 Creating message in database...');

    const message = await Message.create({
      conversationId,
      sender: user.userId,
      senderName: user.name,
      senderInitial: user.name.charAt(0).toUpperCase(),
      receiver: receiverId,
      receiverName: receiver.name, // Use actual receiver name from database
      text: encryptedText,
      mediaUrl,
      mediaType,
      fileName,
      fileSize,
      encrypted: true,
      read: false,
    });

    console.log('✅ Message created successfully:', message._id);

    return NextResponse.json({
      success: true,
      message: {
        id: message._id,
        from: 'me',
        text: text && text.trim() ? text.trim() : '', // Return decrypted text to sender
        mediaUrl,
        mediaType,
        fileName,
        fileSize,
        time: new Date(message.createdAt).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
        createdAt: message.createdAt,
        encrypted: true,
      },
    });
  } catch (error) {
    console.error('❌ Send message error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send message' },
      { status: 500 }
    );
  }
}
