import { sendTestEmail, sendWelcomeEmail } from './backend/services/emailService.js';

// Set environment variables directly
process.env.POSTMARK_API_KEY = 'e92a7bb6-e0a4-4ed4-907f-cadf953adeef';
process.env.POSTMARK_FROM_EMAIL = 'noreply@adgeniusai.io';
process.env.APP_URL = 'https://nanobananaadfrontend-production.up.railway.app';

async function runTests() {
  console.log('🧪 Testing Postmark Email Service\n');

  // Test 1: Basic test email
  console.log('📧 Test 1: Sending test email to icemusike10@gmail.com...');
  const testResult = await sendTestEmail('icemusike10@gmail.com');

  if (testResult.success) {
    console.log('✅ Test email sent successfully!');
    console.log('   Message ID:', testResult.messageId);
  } else {
    console.log('❌ Test email failed:', testResult.error);
  }

  console.log('\n---\n');

  // Test 2: Welcome email
  console.log('📧 Test 2: Sending welcome email to icemusike10@gmail.com...');
  const welcomeResult = await sendWelcomeEmail({
    to: 'icemusike10@gmail.com',
    name: 'Adrian Isfan',
    email: 'icemusike10@gmail.com',
    password: 'TestPass123!',
    productName: 'Starter License (Test)',
    licenseKey: 'TEST-XXXX-YYYY-ZZZZ'
  });

  if (welcomeResult.success) {
    console.log('✅ Welcome email sent successfully!');
    console.log('   Message ID:', welcomeResult.messageId);
  } else {
    console.log('❌ Welcome email failed:', welcomeResult.error);
  }

  console.log('\n📬 Check your inbox at icemusike10@gmail.com!');
  console.log('(Check spam folder if you don\'t see it)\n');
}

// Run the tests
runTests().catch(console.error);
