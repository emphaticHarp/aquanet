async function testLogin() {
  console.log('🔐 Testing login API...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'soumya@aquanet.com',
        password: 'password123',
      }),
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ Login successful!');
      console.log('Token:', data.token.substring(0, 20) + '...');
    } else {
      console.log('\n❌ Login failed!');
      console.log('Error:', data.message);
    }
  } catch (error: any) {
    console.error('❌ Request failed:', error.message);
    console.log('\n💡 Make sure the dev server is running (npm run dev)');
  }
}

testLogin();
