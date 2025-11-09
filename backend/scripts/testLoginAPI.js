// Test login API directly
const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'isfanbogdan@gmail.com',
        password: 'WEbmaster10@@'
      })
    });

    const data = await response.json();

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Login successful!');
      console.log('Token:', data.token);
    } else {
      console.log('\n❌ Login failed!');
      console.log('Error:', data.error);
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.log('\n⚠️ Make sure the backend server is running on http://localhost:3001');
  }
};

testLogin();
