import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      retryReads: true,
      directConnection: false,
    };

    console.log('🔌 Attempting to connect to MongoDB...');
    console.log('📍 URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@'));

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully!');
        console.log('📊 Database:', mongoose.connection.db.databaseName);
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection failed:', error.message);
        
        // Provide helpful error messages
        if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
          console.error('💡 DNS lookup failed. Possible solutions:');
          console.error('   1. Check if MongoDB Atlas cluster exists');
          console.error('   2. Verify the connection string is correct');
          console.error('   3. Try using a standard connection string instead of SRV');
          console.error('   4. Check your DNS settings (try 8.8.8.8 or 1.1.1.1)');
        } else if (error.message.includes('authentication failed')) {
          console.error('💡 Authentication failed. Check username and password.');
        } else if (error.message.includes('timeout')) {
          console.error('💡 Connection timeout. Check network and firewall settings.');
        }
        
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

export default connectDB;
