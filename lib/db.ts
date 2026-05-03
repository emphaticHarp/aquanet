import dns from 'dns';
import mongoose from 'mongoose';

// MUST be first - set DNS before any other imports or connections
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const cached: CachedConnection = (global as any).mongooseCache ?? { conn: null, promise: null };
(global as any).mongooseCache = cached;

async function connectWithRetry(retries = 3, delay = 1000): Promise<typeof mongoose> {
  try {
    return await mongoose.connect(MONGODB_URI!, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      w: 'majority',
      family: 4,
      authSource: 'admin',
    });
  } catch (err: any) {
    if (retries > 0 && err.code === 'ECONNREFUSED') {
      console.log(`⏳ Retrying MongoDB connection in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return connectWithRetry(retries - 1, delay * 2);
    }
    throw err;
  }
}

export async function connectDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = connectWithRetry()
      .then((conn) => {
        console.log('✅ MongoDB connected');
        return conn;
      })
      .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
}

export async function disconnectDatabase() {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}
