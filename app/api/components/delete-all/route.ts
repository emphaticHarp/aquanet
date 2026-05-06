import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Component from '@/models/Component';
import jwt from 'jsonwebtoken';

function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(authHeader.substring(7), process.env.JWT_SECRET!) as {
      userId: string; email: string; name: string;
    };
  } catch { return null; }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const user = verifyToken(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const result = await Component.deleteMany({});
    return NextResponse.json({ success: true, deleted: result.deletedCount });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
