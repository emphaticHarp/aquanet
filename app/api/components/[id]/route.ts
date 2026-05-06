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

// PUT - update component
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = verifyToken(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { name, category, status, productLink, quantity, unitPrice } = await req.json();

    const qty = parseFloat(quantity) || 1;
    const price = parseFloat(unitPrice) || 0;
    const total = qty * price;

    const component = await Component.findByIdAndUpdate(
      id,
      { name, category, status, productLink, quantity: qty, unitPrice: price, totalPrice: total },
      { new: true }
    );

    if (!component) return NextResponse.json({ success: false, message: 'Component not found' }, { status: 404 });
    return NextResponse.json({ success: true, component });
  } catch (error) {
    console.error('Update component error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update component' }, { status: 500 });
  }
}

// DELETE - delete component
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = verifyToken(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await Component.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete component error:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete component' }, { status: 500 });
  }
}
