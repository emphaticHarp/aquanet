import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import jwt from 'jsonwebtoken';

// Helper to verify JWT token
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

// GET - Fetch all posts
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    return NextResponse.json({
      success: true,
      posts,
      hasMore: posts.length === limit,
    });
  } catch (error) {
    console.error('Fetch posts error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST - Create a new post
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

    const { text, mediaUrl, mediaType } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Post text is required' },
        { status: 400 }
      );
    }

    const post = await Post.create({
      author: user.userId,
      authorName: user.name,
      authorEmail: user.email,
      authorInitial: user.name.charAt(0).toUpperCase(),
      text: text.trim(),
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null,
      likes: [],
      likesCount: 0,
      comments: [],
      shares: 0,
    });

    return NextResponse.json({
      success: true,
      message: 'Post created successfully',
      post,
    });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create post' },
      { status: 500 }
    );
  }
}
