import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
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

// POST - Add a comment to a post
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

    const { id } = await params;
    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Comment text is required' },
        { status: 400 }
      );
    }

    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      );
    }

    const comment = {
      _id: new (require('mongoose').Types.ObjectId)(),
      author: user.userId as any,
      authorName: user.name,
      authorInitial: user.name.charAt(0).toUpperCase(),
      text: text.trim(),
      createdAt: new Date(),
    };

    post.comments.push(comment);
    await post.save();

    return NextResponse.json({
      success: true,
      message: 'Comment added successfully',
      comment,
      commentsCount: post.comments.length,
    });
  } catch (error) {
    console.error('Add comment error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

// GET - Get comments for a post
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const post = await Post.findById(id).select('comments').lean();

    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      comments: post.comments || [],
    });
  } catch (error) {
    console.error('Fetch comments error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}
