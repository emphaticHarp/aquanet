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

// POST - Toggle like on a post
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
    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      );
    }

    const userIdObj = user.userId;
    const likeIndex = post.likes.findIndex(
      (like) => like.toString() === userIdObj
    );

    let liked = false;
    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      // Like
      post.likes.push(userIdObj as any);
      post.likesCount += 1;
      liked = true;
    }

    await post.save();

    return NextResponse.json({
      success: true,
      liked,
      likesCount: post.likesCount,
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}
