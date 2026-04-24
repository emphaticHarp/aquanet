import { connectDatabase } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🏥 Health check initiated');

    await connectDatabase();

    console.log('✅ Health check passed - Database is healthy');

    return NextResponse.json(
      {
        success: true,
        message: 'Database connection healthy',
        status: 'connected',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Health check failed:', error.message);

    return NextResponse.json(
      {
        success: false,
        message: 'Database connection failed',
        status: 'disconnected',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Connection error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
