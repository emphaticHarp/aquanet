import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  const start = Date.now();
  try {
    await connectDB();
    const ping = Date.now() - start;

    // Check connection state
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const state = mongoose.connection.readyState;

    if (state === 1) {
      return NextResponse.json({
        success: true,
        status: 'connected',
        ping,
        database: mongoose.connection.db.databaseName,
      });
    } else {
      return NextResponse.json({
        success: false,
        status: 'disconnected',
        ping,
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      status: 'error',
      message: error.message,
      ping: Date.now() - start,
    });
  }
}
