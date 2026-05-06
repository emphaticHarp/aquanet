import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { components } = await req.json();
  const sample = components?.slice(0, 3);
  console.log('DEBUG - First 3 components received:', JSON.stringify(sample, null, 2));
  return NextResponse.json({ received: sample });
}
