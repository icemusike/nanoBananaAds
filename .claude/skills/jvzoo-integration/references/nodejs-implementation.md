# Node.js + Express Implementation

Complete production-ready JVZoo integration using Express.js, with examples for MongoDB and PostgreSQL.

## Installation

```bash
npm install express body-parser crypto dotenv mongoose
# Or for PostgreSQL
npm install express body-parser crypto dotenv pg
```

## Complete Express Server

```javascript
// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Database connection
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Models
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  createdVia: String,
  jvzooTransaction: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const LicenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: String, required: true },
  licenseKey: { type: String, required: true, unique: true },
  jvzooTransaction: { type: String, required: true, unique: true },
  jvzooReceipt: String,
  status: { type: String, required: true },
  purchaseDate: { type: Date, required: true },
  expiryDate: Date,
  lastValidated: Date,
  transactionType: String,
  refundedAt: Date,
  chargebackAt: Date,
  cancelledAt: Date,
  paymentCount: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const TransactionSchema = new mongoose.Schema({
  jvzooTransactionId: { type: String, required: true, unique: true },
  transactionType: { type: String, required: true },
  productId: { type: String, required: true },
  customerEmail: { type: String, required: true },
  amount: Number,
  rawIpnData: Object,
  processed: { type: Boolean, default: false },
  processedAt: Date,
  error: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const License = mongoose.model('License', LicenseSchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);

// Product mapping
const PRODUCT_MAPPING = {
  '123456': {
    name: 'AI Ranker Pro - Basic',
    features: ['keyword_tracking', 'competitor_analysis'],
    internalId: 'ai-ranker-basic'
  },
  '123457': {
    name: 'AI Ranker Pro - Premium',
    features: ['keyword_tracking', 'competitor_analysis', 'ai_insights', 'api_access'],
    internalId: 'ai-ranker-premium'
  }
};

// Verification function
function verifyIPN(ipnData, secretKey) {
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

// License key generation
function generateLicenseKey(userId, productId, transactionId) {
  const timestamp = Date.now();
  const data = `${userId}:${productId}:${transactionId}:${timestamp}`;
  const hash = crypto
    .createHash('sha256')
    .update(data + process.env.LICENSE_SECRET)
    .digest('hex');
  
  return hash.substring(0, 16).toUpperCase().match(/.{1,4}/g).join('-');
}

// Email sending (implement with your email service)
async function sendWelcomeEmail(user, license, productInfo) {
  // Use SendGrid, Mailgun, AWS SES, etc.
  console.log(`Sending welcome email to ${user.email} with license: ${license.licenseKey}`);
  
  // Example with nodemailer:
  // const nodemailer = require('nodemailer');
  // const transporter = nodemailer.createTransporter({ ... });
  // await transporter.sendMail({
  //   to: user.email,
  //   subject: `Welcome to ${productInfo.name}!`,
  //   html: `
  //     <h1>Welcome ${user.name}!</h1>
  //     <p>Your license key: <strong>${license.licenseKey}</strong></p>
  //     <p>Login here: ${process.env.APP_URL}/login</p>
  //   `
  // });
}

// Transaction processors
async function processSale(ipnData) {
  const productConfig = PRODUCT_MAPPING[ipnData.cproditem];
  if (!productConfig) {
    throw new Error(`Unknown product ID: ${ipnData.cproditem}`);
  }
  
  // Create or find user
  let user = await User.findOne({ email: ipnData.ccustemail.toLowerCase() });
  
  if (!user) {
    user = await User.create({
      email: ipnData.ccustemail.toLowerCase(),
      name: ipnData.ccustname,
      createdVia: 'jvzoo',
      jvzooTransaction: ipnData.ctransaction
    });
  }
  
  // Generate and create license
  const licenseKey = generateLicenseKey(user._id, ipnData.cproditem, ipnData.ctransaction);
  
  const license = await License.create({
    userId: user._id,
    productId: ipnData.cproditem,
    licenseKey: licenseKey,
    jvzooTransaction: ipnData.ctransaction,
    jvzooReceipt: ipnData.ctransreceipt,
    status: 'active',
    purchaseDate: new Date(),
    transactionType: ipnData.ctransaction_type
  });
  
  // Send welcome email
  await sendWelcomeEmail(user, license, productConfig);
  
  return { user, license };
}

async function processRefund(ipnData) {
  const license = await License.findOne({ jvzooTransaction: ipnData.ctransaction });
  
  if (license) {
    license.status = 'refunded';
    license.refundedAt = new Date();
    await license.save();
    
    // Additional: notify user, revoke access, etc.
  }
}

async function processChargeback(ipnData) {
  const license = await License.findOne({ jvzooTransaction: ipnData.ctransaction });
  
  if (license) {
    license.status = 'chargeback';
    license.chargebackAt = new Date();
    await license.save();
    
    // Additional: flag account, revoke access, etc.
  }
}

async function processRecurringPayment(ipnData) {
  const license = await License.findOne({ jvzooTransaction: ipnData.ctransaction });
  
  if (license) {
    license.status = 'active';
    license.paymentCount = (license.paymentCount || 1) + 1;
    license.lastValidated = new Date();
    await license.save();
  }
}

async function processCancellation(ipnData) {
  const license = await License.findOne({ jvzooTransaction: ipnData.ctransaction });
  
  if (license) {
    license.status = 'cancelled';
    license.cancelledAt = new Date();
    await license.save();
    
    // Schedule access revocation after grace period
  }
}

// Main IPN handler
app.post('/ipn', async (req, res) => {
  // Always return 200 OK immediately
  res.status(200).send('OK');
  
  try {
    const ipnData = req.body;
    
    // Log raw IPN
    console.log('Received IPN:', ipnData);
    
    // Create transaction record
    const transactionRecord = await Transaction.create({
      jvzooTransactionId: ipnData.ctransaction,
      transactionType: ipnData.ctransaction_type,
      productId: ipnData.cproditem,
      customerEmail: ipnData.ccustemail,
      amount: parseFloat(ipnData.ctransamount || 0),
      rawIpnData: ipnData,
      processed: false
    });
    
    // Verify IPN authenticity
    if (!verifyIPN(ipnData, process.env.JVZOO_SECRET_KEY)) {
      transactionRecord.error = 'IPN verification failed';
      await transactionRecord.save();
      console.error('IPN verification failed');
      return;
    }
    
    // Check for duplicate
    const existingLicense = await License.findOne({ 
      jvzooTransaction: ipnData.ctransaction 
    });
    
    if (existingLicense && ipnData.ctransaction_type === 'SALE') {
      console.log('Duplicate transaction, skipping');
      transactionRecord.processed = true;
      transactionRecord.processedAt = new Date();
      await transactionRecord.save();
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
    
    // Mark as processed
    transactionRecord.processed = true;
    transactionRecord.processedAt = new Date();
    await transactionRecord.save();
    
    console.log('IPN processed successfully');
    
  } catch (error) {
    console.error('Error processing IPN:', error);
    
    // Update transaction record with error
    try {
      await Transaction.updateOne(
        { jvzooTransactionId: req.body.ctransaction },
        { error: error.message }
      );
    } catch (updateError) {
      console.error('Error updating transaction record:', updateError);
    }
  }
});

// License validation endpoint
app.post('/api/validate-license', async (req, res) => {
  try {
    const { license_key, email } = req.body;
    
    if (!license_key || !email) {
      return res.status(400).json({ 
        valid: false, 
        error: 'Missing license_key or email' 
      });
    }
    
    const license = await License.findOne({
      licenseKey: license_key,
      status: 'active'
    }).populate('userId');
    
    if (!license) {
      return res.json({ valid: false, error: 'Invalid or inactive license' });
    }
    
    if (license.userId.email !== email.toLowerCase()) {
      return res.json({ valid: false, error: 'Email mismatch' });
    }
    
    // Check expiry if applicable
    if (license.expiryDate && license.expiryDate < new Date()) {
      return res.json({ valid: false, error: 'License expired' });
    }
    
    // Update last validation timestamp
    license.lastValidated = new Date();
    await license.save();
    
    const productConfig = PRODUCT_MAPPING[license.productId];
    
    return res.json({
      valid: true,
      license: {
        product_id: license.productId,
        product_name: productConfig?.name,
        features: productConfig?.features,
        purchase_date: license.purchaseDate,
        expiry_date: license.expiryDate,
        status: license.status
      }
    });
    
  } catch (error) {
    console.error('License validation error:', error);
    return res.status(500).json({ 
      valid: false, 
      error: 'Internal server error' 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`JVZoo IPN server running on port ${PORT}`);
});
```

## Environment Variables

Create a `.env` file:

```bash
# Database
DATABASE_URL=mongodb://localhost:27017/jvzoo_integration

# JVZoo
JVZOO_SECRET_KEY=your_secret_key_from_jvzoo

# License Generation
LICENSE_SECRET=random_string_for_license_generation

# App
PORT=3000
APP_URL=https://yourdomain.com

# Email (example with SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com
```

## PostgreSQL Alternative

Replace Mongoose with PostgreSQL:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Create user
async function createUser(email, name, transaction) {
  const result = await pool.query(
    `INSERT INTO users (email, name, created_via, jvzoo_transaction)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
     RETURNING *`,
    [email, name, 'jvzoo', transaction]
  );
  return result.rows[0];
}

// Create license
async function createLicense(userId, productId, licenseKey, ipnData) {
  const result = await pool.query(
    `INSERT INTO licenses 
     (user_id, product_id, license_key, jvzoo_transaction, jvzoo_receipt, 
      status, purchase_date, transaction_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [userId, productId, licenseKey, ipnData.ctransaction, ipnData.ctransreceipt,
     'active', new Date(), ipnData.ctransaction_type]
  );
  return result.rows[0];
}

// Validate license
async function validateLicense(licenseKey, email) {
  const result = await pool.query(
    `SELECT l.*, u.email 
     FROM licenses l
     JOIN users u ON l.user_id = u.id
     WHERE l.license_key = $1 AND l.status = 'active' AND u.email = $2`,
    [licenseKey, email]
  );
  return result.rows[0];
}
```

## Testing

```javascript
// test-ipn.js
const axios = require('axios');
const crypto = require('crypto');

const SECRET_KEY = 'your_secret_key';
const IPN_URL = 'http://localhost:3000/ipn';

function generateTestIPN() {
  const transaction = `TEST${Date.now()}`;
  const amount = '97.00';
  const productId = '123456';
  
  const hash = crypto
    .createHash('sha1')
    .update(`${SECRET_KEY}|${transaction}|${amount}|${productId}`)
    .digest('hex')
    .toUpperCase();
  
  return {
    ctransaction: transaction,
    ccustemail: 'test@example.com',
    ccustname: 'Test User',
    cproditem: productId,
    ctransamount: amount,
    ctransaction_type: 'SALE',
    ctransreceipt: `RCP${Date.now()}`,
    cverify: hash
  };
}

async function testIPN() {
  const ipnData = generateTestIPN();
  console.log('Sending test IPN:', ipnData);
  
  try {
    const response = await axios.post(IPN_URL, ipnData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    console.log('Response:', response.status, response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testIPN();
```

Run test:
```bash
node test-ipn.js
```

## Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const ipnLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many IPN requests'
});

app.post('/ipn', ipnLimiter, async (req, res) => {
  // ... handler code
});
```

## Logging

Use Winston for production logging:

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Use in IPN handler
logger.info('IPN received', { transaction: ipnData.ctransaction });
logger.error('IPN processing failed', { error: error.message, ipnData });
```
