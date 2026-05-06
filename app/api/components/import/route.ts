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

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = verifyToken(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const components = body.components;

    if (!Array.isArray(components) || components.length === 0) {
      return NextResponse.json({ success: false, message: 'No components provided' }, { status: 400 });
    }

    // Log first item for debugging
    console.log('📦 Import received. First item:', JSON.stringify(components[0]));

    const results = { created: 0, skipped: 0, errors: [] as string[] };

    for (const comp of components) {
      try {
        const name = String(comp['Component Name'] || comp.name || '').trim();
        if (!name || name.length < 2) { results.skipped++; continue; }

        const category = String(comp.category || 'General').trim();
        const status = 'not-ordered';

        const rawLink = String(comp['Product Link'] || comp.productLink || '').trim();
        const productLink = rawLink.startsWith('http') ? rawLink : undefined;

        // Force number conversion - critical fix
        const quantity = Math.max(1, Number(comp.Quantity) || 1);
        const unitPrice = Number(comp['Unit Price']) || 0;
        const totalPrice = quantity * unitPrice;

        console.log(`💾 ${name}: qty=${quantity}, unit=${unitPrice}, total=${totalPrice}`);

        await Component.create({
          name,
          category,
          status,
          productLink,
          quantity,
          unitPrice,
          totalPrice,
          addedBy: user.name,
        });
        results.created++;
      } catch (err: any) {
        console.error('Row error:', err.message);
        results.errors.push(`${comp['Component Name']}: ${err.message}`);
        results.skipped++;
      }
    }

    console.log(`✅ Import done: ${results.created} created, ${results.skipped} skipped`);

    return NextResponse.json({
      success: true,
      message: `Imported ${results.created} components${results.skipped > 0 ? `, skipped ${results.skipped}` : ''}`,
      ...results,
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ success: false, message: 'Import failed: ' + error.message }, { status: 500 });
  }
}
