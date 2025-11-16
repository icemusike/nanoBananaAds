import express from 'express';
import { verifyJVZooIPN, processTransaction, sendWelcomeEmail, sendUpgradeNotification } from '../services/jvzooService.js';

const router = express.Router();

/**
 * JVZoo IPN (Instant Payment Notification) Endpoint
 *
 * This endpoint receives webhooks from JVZoo for:
 * - SALE: New purchase
 * - RFND: Refund
 * - CGBK: Chargeback
 * - INSTAL: Recurring payment
 * - CANCEL-REBILL: Subscription cancellation
 *
 * IMPORTANT: Always return HTTP 200, or JVZoo will retry
 */
router.post('/ipn', async (req, res) => {
  console.log('=== JVZoo IPN Received ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('IP:', req.ip);
  console.log('Body:', req.body);

  try {
    const ipnData = req.body;

    // Validate required fields
    const requiredFields = ['ctransaction', 'cproditem', 'ccustemail', 'cverify'];
    const missingFields = requiredFields.filter(field => !ipnData[field]);

    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      // Still return 200 to prevent retries
      return res.status(200).send('Missing required fields');
    }

    // Get secret key from environment
    const secretKey = process.env.JVZOO_SECRET_KEY;
    if (!secretKey) {
      console.error('JVZOO_SECRET_KEY not configured');
      return res.status(200).send('Server configuration error');
    }

    // Verify IPN authenticity
    const isValid = verifyJVZooIPN(ipnData, secretKey);

    if (!isValid) {
      console.error('IPN verification failed - invalid signature');
      console.error('Provided hash:', ipnData.cverify);
      // Still return 200 to prevent retries
      return res.status(200).send('Verification failed');
    }

    console.log('✓ IPN verified successfully');

    // Process the transaction
    const result = await processTransaction(ipnData);

    if (result.alreadyProcessed) {
      console.log('Transaction already processed (idempotency check)');
      return res.status(200).send('Already processed');
    }

    console.log('✓ Transaction processed successfully');

    // Send appropriate email for new sales
    if (ipnData.ctransaction === 'SALE' && result.user && result.license) {
      try {
        // Check if this is a frontend purchase (new account) or an upgrade
        const isFrontend = result.license.productId === 'frontend';

        if (isFrontend) {
          // Frontend purchase: Send welcome email with password
          await sendWelcomeEmail(result.user, result.license);
          console.log('✓ Welcome email sent (new account)');
        } else {
          // Upgrade purchase: Send upgrade notification (no password change)
          await sendUpgradeNotification(result.user, result.license);
          console.log('✓ Upgrade notification sent (existing account)');
        }
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Don't fail the IPN because of email error
      }
    }

    // Return success
    console.log('=== IPN Processing Complete ===\n');
    return res.status(200).send('IPN processed successfully');

  } catch (error) {
    console.error('Error processing IPN:', error);
    console.error('Stack:', error.stack);

    // IMPORTANT: Still return 200 to prevent JVZoo from retrying
    // The error is logged and saved to the audit log
    return res.status(200).send('Error logged');
  }
});

/**
 * Test endpoint to verify IPN setup
 * GET /api/jvzoo/test
 */
router.get('/test', (req, res) => {
  const hasSecretKey = !!process.env.JVZOO_SECRET_KEY;
  const hasLicenseSecret = !!process.env.LICENSE_SECRET;

  res.json({
    status: 'JVZoo Integration Active',
    timestamp: new Date().toISOString(),
    ipnEndpoint: '/api/jvzoo/ipn',
    configuration: {
      jvzooSecretKey: hasSecretKey ? 'Configured ✓' : 'Missing ✗',
      licenseSecret: hasLicenseSecret ? 'Configured ✓' : 'Missing ✗'
    },
    usage: {
      ipnUrl: `${req.protocol}://${req.get('host')}/api/jvzoo/ipn`,
      instructions: 'Configure this URL in your JVZoo product settings'
    }
  });
});

/**
 * Manual transaction test endpoint (for development only)
 * POST /api/jvzoo/test-transaction
 *
 * Use this to simulate a JVZoo IPN for testing
 */
router.post('/test-transaction', async (req, res) => {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not available in production' });
  }

  const {
    email = 'test@example.com',
    name = 'Test Customer',
    productId = '123456',
    amount = '47.00',
    transactionType = 'SALE'
  } = req.body;

  const transactionId = `TEST-${Date.now()}`;
  const receiptId = `RCPT-${Date.now()}`;
  const secretKey = process.env.JVZOO_SECRET_KEY || 'test-secret-key';

  // Create verification hash using JVZoo formula
  // Formula: secretKey|receipt|product|country|affiliate|vendthru
  const crypto = await import('crypto');
  const verificationString = [
    secretKey,
    receiptId,
    productId,
    'US',
    '0',
    amount
  ].join('|');

  const fullHash = crypto
    .createHash('sha1')
    .update(verificationString)
    .digest('hex')
    .toUpperCase();

  // JVZoo uses only first 8 characters
  const cverify = fullHash.substring(0, 8);

  const testIPN = {
    ctransaction: transactionType,
    ctransreceipt: receiptId,
    cproditem: productId,
    ccustemail: email,
    ccustname: name,
    ccustcc: 'US',
    ccuststate: 'CA',
    ctransamount: amount,
    ctransaffiliate: '0',
    caffitid: '',
    cvendthru: amount,
    cverify
  };

  console.log('Test IPN:', testIPN);

  try {
    const result = await processTransaction(testIPN);
    res.json({
      success: true,
      message: 'Test transaction processed',
      result
    });
  } catch (error) {
    console.error('Test transaction error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
