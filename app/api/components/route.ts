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

// GET - fetch all components
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = verifyToken(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const components = await Component.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, components });
  } catch (error) {
    console.error('Fetch components error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch components' }, { status: 500 });
  }
}

// POST - create component
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = verifyToken(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { name, category, status, productLink, quantity, unitPrice } = await req.json();
    if (!name) {
      return NextResponse.json({ success: false, message: 'Component name is required' }, { status: 400 });
    }

    const qty = parseFloat(quantity) || 1;
    const price = parseFloat(unitPrice) || 0;
    const total = qty * price;

    const component = await Component.create({
      name,
      category: category || 'General',
      status: status || 'not-ordered',
      productLink,
      quantity: qty,
      unitPrice: price,
      totalPrice: total,
      addedBy: user.name,
    });

    return NextResponse.json({ success: true, component });
  } catch (error) {
    console.error('Create component error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create component' }, { status: 500 });
  }
}
