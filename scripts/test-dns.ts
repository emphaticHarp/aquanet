import { promises as dns } from 'dns';

async function testDNS() {
  console.log('🔍 Testing DNS resolution for MongoDB...\n');
  
  const hostname = '_mongodb._tcp.cluster0.xoqwxjx.mongodb.net';
  
  try {
    console.log(`Resolving: ${hostname}`);
    const records = await dns.resolveSrv(hostname);
    console.log('✅ DNS resolution successful!');
    console.log('📋 SRV Records:', records);
  } catch (error: any) {
    console.error('❌ DNS resolution failed!');
    console.error('Error:', error.message);
    console.log('\n💡 Solutions:');
    console.log('1. Change your DNS to Google DNS (8.8.8.8, 8.8.4.4)');
    console.log('2. Change your DNS to Cloudflare (1.1.1.1, 1.0.0.1)');
    console.log('3. Use a standard MongoDB connection string instead of SRV');
    console.log('4. Check if your ISP is blocking MongoDB');
  }
}

testDNS();
