import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// ── Connection cache (reuse across hot reloads in dev) ────────
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache;
}

if (!global._mongooseCache) {
  global._mongooseCache = { conn: null, promise: null };
}

const cache = global._mongooseCache;

// ── Connect ───────────────────────────────────────────────────
async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection
  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn;
  }

  // Reset if previous attempt failed
  if (mongoose.connection.readyState === 0) {
    cache.promise = null;
  }

  if (!cache.promise) {
    console.log('🔌 Connecting to MongoDB...');

    cache.promise = mongoose.connect(MONGODB_URI as string, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      retryReads: true,
      tls: true,
      tlsAllowInvalidCertificates: false,
    }).then((m) => {
      console.log('✅ MongoDB connected:', m.connection.db.databaseName);
      return m;
    }).catch((err) => {
      console.error('❌ MongoDB connection error:', err.message);
      cache.promise = null;
      throw err;
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

export default connectDB;
