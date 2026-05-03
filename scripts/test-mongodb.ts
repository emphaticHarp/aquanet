import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://soumyajyotibanik07_db_user:bH2l2bFWpbBEaOq5@cluster0.xoqwxjx.mongodb.net/aquanet?retryWrites=true&w=majority&appName=Cluster0';

async function testConnection() {
  console.log('🔌 Testing MongoDB Atlas connection...');
  
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    
    console.log('✅ MongoDB Atlas connected successfully!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    
    await mongoose.disconnect();
    console.log('👋 Disconnected');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ MongoDB connection failed!');
    console.error('Error:', error.message);
    
    console.log('\n💡 Your network is blocking MongoDB Atlas.');
    console.log('   Use local MongoDB for now: mongodb://localhost:27017/aquanet');
    
    process.exit(1);
  }
}

testConnection();
