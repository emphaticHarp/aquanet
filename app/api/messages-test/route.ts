import { NextRequest, NextResponse } from 'next/server';

// In-memory message storage for testing
const messages: any[] = [];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const otherUserId = searchParams.get('userId');

  const userMessages = messages.filter(
    (msg) => msg.receiverId === otherUserId || msg.senderId === otherUserId
  );

  return NextResponse.json({
    success: true,
    messages: userMessages.map((msg) => ({
      id: msg.id,
      from: msg.from,
      text: msg.text,
      mediaUrl: msg.mediaUrl,
      mediaType: msg.mediaType,
      fileName: msg.fileName,
      fileSize: msg.fileSize,
      time: msg.time,
      createdAt: msg.createdAt,
    })),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { receiverId, receiverName, text, mediaUrl, mediaType, fileName, fileSize } = await req.json();

    console.log('📨 Received message:', { receiverId, text, mediaUrl, mediaType, fileName, fileSize });

    const message = {
      id: Date.now().toString(),
      senderId: 'test-user',
      receiverId,
      from: 'me',
      text: text || '',
      mediaUrl,
      mediaType,
      fileName,
      fileSize,
      time: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
      createdAt: new Date(),
    };

    messages.push(message);

    console.log('✅ Message saved:', message.id);

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send message' },
      { status: 500 }
    );
  }
}
