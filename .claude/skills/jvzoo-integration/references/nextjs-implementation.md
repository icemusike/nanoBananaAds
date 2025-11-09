# Next.js + Supabase Implementation

Complete serverless JVZoo integration using Next.js API Routes and Supabase.

## Installation

```bash
npm install @supabase/supabase-js crypto
```

## Supabase Setup

### Database Schema

Run these SQL commands in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_via VARCHAR(50),
  jvzoo_transaction VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Licenses table
CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id VARCHAR(100) NOT NULL,
  license_key VARCHAR(50) UNIQUE NOT NULL,
  jvzoo_transaction VARCHAR(255) UNIQUE NOT NULL,
  jvzoo_receipt VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  purchase_date TIMESTAMP NOT NULL,
  expiry_date TIMESTAMP,
  last_validated TIMESTAMP,
  transaction_type VARCHAR(50),
  refunded_at TIMESTAMP,
  chargeback_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  payment_count INTEGER DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Transactions audit table
CREATE TABLE jvzoo_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jvzoo_transaction_id VARCHAR(255) UNIQUE NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  product_id VARCHAR(100) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2),
  raw_ipn_data JSONB,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP,
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_licenses_user_id ON licenses(user_id);
CREATE INDEX idx_licenses_status ON licenses(status);
CREATE INDEX idx_licenses_jvzoo_transaction ON licenses(jvzoo_transaction);
CREATE INDEX idx_transactions_processed ON jvzoo_transactions(processed);
CREATE INDEX idx_transactions_customer_email ON jvzoo_transactions(customer_email);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only see their own data)
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view own licenses" ON licenses
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- Service role bypass (for your backend)
CREATE POLICY "Service role full access to users" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to licenses" ON licenses
  FOR ALL USING (auth.role() = 'service_role');
```

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

JVZOO_SECRET_KEY=your_jvzoo_secret
LICENSE_SECRET=your_license_secret

# Email (using Resend, SendGrid, or similar)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com

NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Lib Setup

```javascript
// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// Client for public operations
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Admin client for backend operations (bypasses RLS)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

```javascript
// lib/jvzoo.js
import crypto from 'crypto';

export const PRODUCT_MAPPING = {
  '123456': {
    name: 'AI Ranker Pro - Basic',
    features: ['keyword_tracking', 'competitor_analysis'],
    internalId: 'ai-ranker-basic',
    stripeProductId: 'prod_xxx' // If you also use Stripe
  },
  '123457': {
    name: 'AI Ranker Pro - Premium',
    features: ['keyword_tracking', 'competitor_analysis', 'ai_insights', 'api_access'],
    internalId: 'ai-ranker-premium',
    stripeProductId: 'prod_yyy'
  }
};

export function verifyIPN(ipnData, secretKey) {
  const { ctransaction, ctransamount, cproditem, cverify } = ipnData;
  
  if (!ctransaction || !ctransamount || !cproditem || !cverify) {
    return false;
  }
  
  const hash = crypto
    .createHash('sha1')
    .update(`${secretKey}|${ctransaction}|${ctransamount}|${cproditem}`)
    .digest('hex')
    .toUpperCase();
  
  return hash === cverify.toUpperCase();
}

export function generateLicenseKey(userId, productId, transactionId) {
  const timestamp = Date.now();
  const data = `${userId}:${productId}:${transactionId}:${timestamp}`;
  const hash = crypto
    .createHash('sha256')
    .update(data + process.env.LICENSE_SECRET)
    .digest('hex');
  
  return hash.substring(0, 16).toUpperCase().match(/.{1,4}/g).join('-');
}

export function isTestTransaction(ipnData) {
  return ipnData.ctransaction.toLowerCase().includes('test') ||
         ipnData.ccustemail.toLowerCase().includes('test');
}
```

```javascript
// lib/email.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(user, license, productInfo) {
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: user.email,
      subject: `Welcome to ${productInfo.name}!`,
      html: `
        <h1>Welcome ${user.name}!</h1>
        <p>Thank you for your purchase of ${productInfo.name}.</p>
        <h2>Your License Details</h2>
        <p><strong>License Key:</strong> ${license.license_key}</p>
        <p><strong>Product:</strong> ${productInfo.name}</p>
        <h2>Get Started</h2>
        <p>Login to your account: <a href="${process.env.NEXT_PUBLIC_APP_URL}/login">${process.env.NEXT_PUBLIC_APP_URL}/login</a></p>
        <p>If you have any questions, please contact our support team.</p>
      `
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

export async function sendRefundNotification(user, license) {
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: user.email,
      subject: 'Refund Processed',
      html: `
        <h1>Refund Confirmation</h1>
        <p>Hello ${user.name},</p>
        <p>Your refund has been processed. Your license has been deactivated.</p>
        <p>Transaction: ${license.jvzoo_transaction}</p>
      `
    });
  } catch (error) {
    console.error('Refund email error:', error);
  }
}
```

## API Route: IPN Handler

```javascript
// pages/api/jvzoo/ipn.js
import { supabaseAdmin } from '../../../lib/supabase';
import { verifyIPN, generateLicenseKey, PRODUCT_MAPPING, isTestTransaction } from '../../../lib/jvzoo';
import { sendWelcomeEmail, sendRefundNotification } from '../../../lib/email';

export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Always return 200 OK to JVZoo immediately
  res.status(200).send('OK');
  
  try {
    const ipnData = req.body;
    
    console.log('IPN Received:', {
      transaction: ipnData.ctransaction,
      type: ipnData.ctransaction_type,
      email: ipnData.ccustemail
    });
    
    // Create transaction audit record
    const { data: transactionRecord, error: transError } = await supabaseAdmin
      .from('jvzoo_transactions')
      .insert({
        jvzoo_transaction_id: ipnData.ctransaction,
        transaction_type: ipnData.ctransaction_type,
        product_id: ipnData.cproditem,
        customer_email: ipnData.ccustemail.toLowerCase(),
        amount: parseFloat(ipnData.ctransamount || 0),
        raw_ipn_data: ipnData,
        processed: false
      })
      .select()
      .single();
    
    if (transError) {
      console.error('Transaction record error:', transError);
      // Continue processing even if audit fails
    }
    
    // Verify IPN authenticity
    if (!verifyIPN(ipnData, process.env.JVZOO_SECRET_KEY)) {
      console.error('IPN verification failed');
      await updateTransactionError(ipnData.ctransaction, 'Verification failed');
      return;
    }
    
    // Skip test transactions in production
    if (process.env.NODE_ENV === 'production' && isTestTransaction(ipnData)) {
      console.log('Skipping test transaction');
      return;
    }
    
    // Process based on transaction type
    switch (ipnData.ctransaction_type) {
      case 'SALE':
        await processSale(ipnData);
        break;
      case 'RFND':
        await processRefund(ipnData);
        break;
      case 'CGBK':
        await processChargeback(ipnData);
        break;
      case 'INSTAL':
        await processRecurringPayment(ipnData);
        break;
      case 'CANCEL-REBILL':
        await processCancellation(ipnData);
        break;
      default:
        console.warn('Unknown transaction type:', ipnData.ctransaction_type);
    }
    
    // Mark transaction as processed
    await supabaseAdmin
      .from('jvzoo_transactions')
      .update({ 
        processed: true, 
        processed_at: new Date().toISOString() 
      })
      .eq('jvzoo_transaction_id', ipnData.ctransaction);
    
    console.log('IPN processed successfully');
    
  } catch (error) {
    console.error('IPN processing error:', error);
    await updateTransactionError(req.body.ctransaction, error.message);
  }
}

async function processSale(ipnData) {
  const productConfig = PRODUCT_MAPPING[ipnData.cproditem];
  
  if (!productConfig) {
    throw new Error(`Unknown product ID: ${ipnData.cproditem}`);
  }
  
  // Check for duplicate
  const { data: existingLicense } = await supabaseAdmin
    .from('licenses')
    .select('id')
    .eq('jvzoo_transaction', ipnData.ctransaction)
    .single();
  
  if (existingLicense) {
    console.log('Duplicate transaction, skipping');
    return;
  }
  
  // Create or find user
  let { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', ipnData.ccustemail.toLowerCase())
    .single();
  
  if (!user) {
    const { data: newUser, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        email: ipnData.ccustemail.toLowerCase(),
        name: ipnData.ccustname,
        created_via: 'jvzoo',
        jvzoo_transaction: ipnData.ctransaction
      })
      .select()
      .single();
    
    if (userError) throw userError;
    user = newUser;
  }
  
  // Generate license key
  const licenseKey = generateLicenseKey(
    user.id,
    ipnData.cproditem,
    ipnData.ctransaction
  );
  
  // Create license
  const { data: license, error: licenseError } = await supabaseAdmin
    .from('licenses')
    .insert({
      user_id: user.id,
      product_id: ipnData.cproditem,
      license_key: licenseKey,
      jvzoo_transaction: ipnData.ctransaction,
      jvzoo_receipt: ipnData.ctransreceipt,
      status: 'active',
      purchase_date: new Date().toISOString(),
      transaction_type: ipnData.ctransaction_type,
      metadata: {
        amount: ipnData.ctransamount,
        affiliate: ipnData.ctransaffiliate,
        vendor: ipnData.ctransvendor
      }
    })
    .select()
    .single();
  
  if (licenseError) throw licenseError;
  
  // Send welcome email
  await sendWelcomeEmail(user, license, productConfig);
  
  console.log('Sale processed:', { user: user.email, license: licenseKey });
}

async function processRefund(ipnData) {
  const { data: license } = await supabaseAdmin
    .from('licenses')
    .select('*, users(*)')
    .eq('jvzoo_transaction', ipnData.ctransaction)
    .single();
  
  if (license) {
    await supabaseAdmin
      .from('licenses')
      .update({
        status: 'refunded',
        refunded_at: new Date().toISOString()
      })
      .eq('id', license.id);
    
    await sendRefundNotification(license.users, license);
    console.log('Refund processed:', ipnData.ctransaction);
  }
}

async function processChargeback(ipnData) {
  await supabaseAdmin
    .from('licenses')
    .update({
      status: 'chargeback',
      chargeback_at: new Date().toISOString()
    })
    .eq('jvzoo_transaction', ipnData.ctransaction);
  
  console.log('Chargeback processed:', ipnData.ctransaction);
}

async function processRecurringPayment(ipnData) {
  const { data: license } = await supabaseAdmin
    .from('licenses')
    .select('payment_count')
    .eq('jvzoo_transaction', ipnData.ctransaction)
    .single();
  
  if (license) {
    await supabaseAdmin
      .from('licenses')
      .update({
        status: 'active',
        payment_count: (license.payment_count || 1) + 1,
        last_validated: new Date().toISOString()
      })
      .eq('jvzoo_transaction', ipnData.ctransaction);
    
    console.log('Recurring payment processed:', ipnData.ctransaction);
  }
}

async function processCancellation(ipnData) {
  await supabaseAdmin
    .from('licenses')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    })
    .eq('jvzoo_transaction', ipnData.ctransaction);
  
  console.log('Cancellation processed:', ipnData.ctransaction);
}

async function updateTransactionError(transactionId, error) {
  await supabaseAdmin
    .from('jvzoo_transactions')
    .update({ error })
    .eq('jvzoo_transaction_id', transactionId);
}

// Disable body parsing to get raw body
export const config = {
  api: {
    bodyParser: true
  }
};
```

## API Route: License Validation

```javascript
// pages/api/validate-license.js
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { license_key, email } = req.body;
    
    if (!license_key || !email) {
      return res.status(400).json({
        valid: false,
        error: 'Missing license_key or email'
      });
    }
    
    // Query license with user data
    const { data: license, error } = await supabaseAdmin
      .from('licenses')
      .select(`
        *,
        users (
          id,
          email,
          name
        )
      `)
      .eq('license_key', license_key)
      .eq('status', 'active')
      .single();
    
    if (error || !license) {
      return res.json({
        valid: false,
        error: 'Invalid or inactive license'
      });
    }
    
    // Verify email matches
    if (license.users.email !== email.toLowerCase()) {
      return res.json({
        valid: false,
        error: 'Email mismatch'
      });
    }
    
    // Check expiry date if applicable
    if (license.expiry_date && new Date(license.expiry_date) < new Date()) {
      return res.json({
        valid: false,
        error: 'License expired'
      });
    }
    
    // Update last validated timestamp
    await supabaseAdmin
      .from('licenses')
      .update({ last_validated: new Date().toISOString() })
      .eq('id', license.id);
    
    // Get product config
    const productConfig = PRODUCT_MAPPING[license.product_id];
    
    return res.json({
      valid: true,
      license: {
        product_id: license.product_id,
        product_name: productConfig?.name,
        features: productConfig?.features,
        purchase_date: license.purchase_date,
        expiry_date: license.expiry_date,
        status: license.status,
        user: {
          name: license.users.name,
          email: license.users.email
        }
      }
    });
    
  } catch (error) {
    console.error('License validation error:', error);
    return res.status(500).json({
      valid: false,
      error: 'Internal server error'
    });
  }
}
```

## Frontend: License Check Component

```javascript
// components/LicenseCheck.js
import { useState } from 'react';

export default function LicenseCheck() {
  const [licenseKey, setLicenseKey] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const validateLicense = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/validate-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_key: licenseKey, email })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ valid: false, error: 'Network error' });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Activate License</h2>
      
      <form onSubmit={validateLicense} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            License Key
          </label>
          <input
            type="text"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            placeholder="XXXX-XXXX-XXXX-XXXX"
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Validating...' : 'Activate'}
        </button>
      </form>
      
      {result && (
        <div className={`mt-4 p-4 rounded ${result.valid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {result.valid ? (
            <div>
              <p className="font-bold">✓ License Valid!</p>
              <p className="text-sm mt-2">Product: {result.license.product_name}</p>
            </div>
          ) : (
            <p>✗ {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
```

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Configure JVZoo IPN URL

Set IPN URL in JVZoo product settings:
```
https://yourdomain.com/api/jvzoo/ipn
```

## Testing

```bash
# Test IPN locally
curl -X POST http://localhost:3000/api/jvzoo/ipn \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "ctransaction=TEST123&ccustemail=test@example.com&ccustname=Test&cproditem=123456&ctransamount=97.00&ctransaction_type=SALE&cverify=YOUR_HASH"
```

## Monitoring

Use Vercel Analytics and Supabase Dashboard to monitor:
- IPN processing times
- Failed transactions
- License validation requests
- Database performance
