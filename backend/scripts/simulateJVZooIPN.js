/**
 * AdGenius AI - JVZoo IPN Simulator
 *
 * This script simulates JVZoo IPN notifications for testing
 *
 * Usage:
 *   node scripts/simulateJVZooIPN.js [productId] [customerEmail]
 *
 * Examples:
 *   node scripts/simulateJVZooIPN.js 427079 test@example.com  // Starter license
 *   node scripts/simulateJVZooIPN.js 427343 test@example.com  // Pro upgrade
 *   node scripts/simulateJVZooIPN.js 427357 test@example.com  // Elite Bundle
 */

import crypto from 'crypto';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// ============================================
// CONFIGURATION
// ============================================

const JVZOO_SECRET_KEY = process.env.JVZOO_SECRET_KEY || 'test-secret-key-12345';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const IPN_ENDPOINT = `${BACKEND_URL}/api/jvzoo/ipn`;

// Product configurations
const PRODUCTS = {
  '427079': { name: 'AdGenius AI Starter', price: 47 },
  '427343': { name: 'Pro Unlimited', price: 97 },
  '427345': { name: 'Pro Lite', price: 67 },
  '427347': { name: 'Template Library', price: 127 },
  '427349': { name: 'Template Pack DS', price: 67 },
  '427351': { name: 'Agency License', price: 197 },
  '427353': { name: 'Agency DS', price: 127 },
  '427355': { name: 'Reseller Rights', price: 297 },
  '427359': { name: 'Reseller Downsell', price: 197 },
  '427357': { name: 'Elite Bundle', price: 397 }
};

// ============================================
// IPN HASH GENERATION
// ============================================

/**
 * Generate JVZoo verification hash
 */
function generateVerificationHash(ipnData, secretKey) {
  const {
    ctransaction,
    cproditem,
    ccustcc,
    ctransaffiliate,
    ctransamount
  } = ipnData;

  // Build verification string (same order as JVZoo)
  const verificationString = [
    secretKey,
    ctransaction,
    cproditem,
    ccustcc,
    ctransaffiliate || '',
    ctransamount
  ].join('|');

  // Calculate SHA-1 hash
  const hash = crypto
    .createHash('sha1')
    .update(verificationString)
    .digest('hex')
    .toUpperCase();

  console.log('🔐 Hash Generation:');
  console.log('  Verification String:', verificationString);
  console.log('  Generated Hash:', hash);

  return hash;
}

// ============================================
// IPN PAYLOAD GENERATION
// ============================================

/**
 * Generate simulated IPN payload
 */
function generateIPNPayload(productId, customerEmail, transactionType = 'SALE') {
  const product = PRODUCTS[productId];

  if (!product) {
    throw new Error(`Unknown product ID: ${productId}. Available: ${Object.keys(PRODUCTS).join(', ')}`);
  }

  // Generate random transaction ID
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const ctransaction = `TEST-${timestamp}-${randomId}`;
  const ctransreceipt = `REC-${timestamp}`;

  // Extract customer name from email
  const ccustname = customerEmail.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim();

  // Build IPN data
  const ipnData = {
    // Transaction details
    ctransaction,          // Transaction ID
    ctransreceipt,         // Receipt ID
    ctransaction_type: transactionType, // SALE, RFND, CGBK, etc.
    cproditem: productId,  // Product ID
    cprodtitle: product.name, // Product name
    cprodtype: 'STANDARD', // Product type

    // Customer details
    ccustemail: customerEmail,
    ccustname,
    ccustcc: 'US',         // Country code
    ccuststate: 'CA',      // State

    // Amount details
    ctransamount: product.price.toFixed(2),
    ctransvendor: '0.00',
    ctransaffiliate: '0.00',

    // Affiliate details (optional)
    ctransaffiliateId: '',

    // Payment details
    cpaymentmethod: 'paypal',
    ctranspaymentmethod: 'paypal',

    // Recurring details (for subscriptions)
    ctransrecurring: '0',

    // Timestamp
    ctranstime: new Date().toISOString(),

    // Verification hash (will be added below)
    cverify: ''
  };

  // Generate verification hash
  ipnData.cverify = generateVerificationHash(ipnData, JVZOO_SECRET_KEY);

  return ipnData;
}

// ============================================
// IPN SIMULATION
// ============================================

/**
 * Send simulated IPN to backend
 */
async function sendIPN(ipnData) {
  try {
    console.log('\n📤 Sending IPN to:', IPN_ENDPOINT);
    console.log('📦 Payload:', JSON.stringify(ipnData, null, 2));

    const response = await axios.post(IPN_ENDPOINT, ipnData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'JVZoo-IPN-Simulator/1.0'
      }
    });

    console.log('\n✅ IPN Response:');
    console.log('  Status:', response.status);
    console.log('  Data:', JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.error('\n❌ IPN Error:');

    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Data:', error.response.data);
    } else if (error.request) {
      console.error('  No response received');
      console.error('  Request:', error.request);
    } else {
      console.error('  Error:', error.message);
    }

    throw error;
  }
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  console.log('🚀 AdGenius AI - JVZoo IPN Simulator\n');
  console.log('=' .repeat(60));

  // Parse command line arguments
  const args = process.argv.slice(2);
  const productId = args[0] || '427079'; // Default to Starter
  const customerEmail = args[1] || `test-${Date.now()}@example.com`;
  const transactionType = args[2] || 'SALE';

  console.log('\n📋 Test Configuration:');
  console.log('  Product ID:', productId);
  console.log('  Product Name:', PRODUCTS[productId]?.name || 'Unknown');
  console.log('  Customer Email:', customerEmail);
  console.log('  Transaction Type:', transactionType);
  console.log('  Secret Key:', JVZOO_SECRET_KEY.substring(0, 10) + '...');
  console.log('  Backend URL:', BACKEND_URL);

  try {
    // Generate IPN payload
    console.log('\n⚙️  Generating IPN payload...');
    const ipnData = generateIPNPayload(productId, customerEmail, transactionType);

    // Send IPN
    const result = await sendIPN(ipnData);

    console.log('\n✨ Simulation Complete!');
    console.log('=' .repeat(60));

    if (result.success) {
      console.log('\n✅ SUCCESS! User and license created:');
      console.log('  User ID:', result.userId);
      console.log('  User Email:', result.userEmail);

      if (result.license) {
        console.log('  License ID:', result.license.id);
        console.log('  License Tier:', result.license.licenseTier);
        console.log('  License Key:', result.license.licenseKey);
      }

      if (result.addon) {
        console.log('  Addon Type:', result.addon.addonType);
      }

      console.log('\n📝 Next Steps:');
      console.log('  1. Check the database to verify the user was created');
      console.log('  2. Login with email:', customerEmail);
      console.log('  3. Verify the license is active in the admin panel');
    } else {
      console.log('\n⚠️  IPN processed but with issues:');
      console.log('  Message:', result.message || 'No message');
    }

  } catch (error) {
    console.error('\n💥 Simulation Failed!');
    console.error('  Error:', error.message);
    process.exit(1);
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Show available products
 */
function showProducts() {
  console.log('\n📦 Available Products:\n');

  Object.entries(PRODUCTS).forEach(([id, info]) => {
    console.log(`  ${id}: ${info.name} - $${info.price}`);
  });

  console.log();
}

// Check if help is requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('\nUsage: node scripts/simulateJVZooIPN.js [productId] [customerEmail] [transactionType]\n');
  console.log('Examples:');
  console.log('  node scripts/simulateJVZooIPN.js 427079 test@example.com SALE');
  console.log('  node scripts/simulateJVZooIPN.js 427343 existing@example.com SALE');
  console.log('  node scripts/simulateJVZooIPN.js 427357 elite@example.com SALE\n');

  showProducts();

  process.exit(0);
}

// Check if products list is requested
if (process.argv.includes('--products') || process.argv.includes('-p')) {
  showProducts();
  process.exit(0);
}

// Run the simulation
main();
