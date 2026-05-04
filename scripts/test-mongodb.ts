import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://soumyajyotibanik07_db_user:869412Soumya@ac-rxrsb1i-shard-00-00.xoqwxjx.mongodb.net:27017,ac-rxrsb1i-shard-00-01.xoqwxjx.mongodb.net:27017,ac-rxrsb1i-shard-00-02.xoqwxjx.mongodb.net:27017/aquanet?ssl=true&replicaSet=atlas-zf90wn-shard-0&authSource=admin&retryWrites=true&w=majority';

async function testConnection() {
  console.log('🔌 Testing direct MongoDB Atlas connection (no SRV)...');
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      tls: true,
    });
    console.log('✅ Connected! Database:', mongoose.connection.db.databaseName);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

testConnection();
