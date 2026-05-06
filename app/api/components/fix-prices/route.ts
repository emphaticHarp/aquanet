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

// POST - recalculate all totalPrice = quantity * unitPrice
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = verifyToken(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const components = await Component.find({});
    let fixed = 0;

    for (const comp of components) {
      const qty = comp.quantity || 1;
      const unitPrice = comp.unitPrice || 0;
      const correctTotal = qty * unitPrice;
      // Only fix if unitPrice > 0 AND totalPrice is wrong
      if (unitPrice > 0 && comp.totalPrice !== correctTotal) {
        comp.totalPrice = correctTotal;
        await comp.save();
        fixed++;
      }
    }

    const all = await Component.find({}).lean();
    const grandTotal = all.reduce((s, c: any) => s + (c.totalPrice || 0), 0);

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixed} components`,
      grandTotal,
      total: all.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
