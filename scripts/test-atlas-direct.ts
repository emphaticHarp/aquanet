import mongoose from 'mongoose';

// Try connecting with different options to bypass DNS issues
const MONGODB_URI = 'mongodb+srv://soumyajyotibanik07_db_user:bH2l2bFWpbBEaOq5@cluster0.xoqwxjx.mongodb.net/aquanet?retryWrites=true&w=majority&appName=Cluster0';

async function testConnection() {
  console.log('🔌 Testing MongoDB Atlas with DNS workaround...\n');
  
  const options = [
    {
      name: 'Standard SRV',
      uri: MONGODB_URI,
      opts: {
        serverSelectionTimeoutMS: 10000,
        family: 4,
      }
    },
    {
      name: 'With directConnection',
      uri: MONGODB_URI,
      opts: {
        serverSelectionTimeoutMS: 10000,
        family: 4,
        directConnection: false,
      }
    },
    {
      name: 'With DNS resolution',
      uri: MONGODB_URI,
      opts: {
        serverSelectionTimeoutMS: 10000,
        family: 4,
        tls: true,
        tlsAllowInvalidCertificates: false,
      }
    },
  ];

  for (const { name, uri, opts } of options) {
    console.log(`\n📡 Trying: ${name}...`);
    try {
      await mongoose.connect(uri, opts);
      console.log('✅ SUCCESS! Connected with:', name);
      console.log('📊 Database:', mongoose.connection.db.databaseName);
      await mongoose.disconnect();
      process.exit(0);
    } catch (error: any) {
      console.log('❌ Failed:', error.message.split('\n')[0]);
      await mongoose.disconnect().catch(() => {});
    }
  }

  console.log('\n❌ All connection attempts failed.');
  console.log('\n💡 Your mobile carrier is blocking MongoDB Atlas.');
  console.log('   Solutions:');
  console.log('   1. Use WiFi instead of mobile hotspot');
  console.log('   2. Use a VPN');
  console.log('   3. Use local MongoDB for development');
  console.log('   4. Deploy to Vercel/Railway (they can connect to Atlas)');
  
  process.exit(1);
}

testConnection();
