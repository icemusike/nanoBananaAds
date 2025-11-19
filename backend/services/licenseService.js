import crypto from 'crypto';
import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

/**
 * Generate a secure license key
 * Format: XXXX-XXXX-XXXX-XXXX
 */
export function generateLicenseKey(email, transactionId, productId) {
  const secret = process.env.LICENSE_SECRET || 'default-license-secret-change-me';
  const timestamp = Date.now();
  const data = `${email}|${transactionId}|${productId}|${timestamp}`;

  const hash = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex')
    .toUpperCase();

  // Format as XXXX-XXXX-XXXX-XXXX
  const key = hash.substring(0, 16).match(/.{1,4}/g).join('-');
  return key;
}

/**
 * Create a new license from JVZoo transaction
 */
export async function createLicense({
  userId,
  jvzooTransactionId,
  jvzooReceiptId,
  jvzooProductId,
  transactionType,
  customerEmail,
  purchaseAmount,
  productId,
  isRecurring = false
}) {
  // Generate unique license key
  const licenseKey = generateLicenseKey(customerEmail, jvzooTransactionId, jvzooProductId);

  try {
    const license = await prisma.license.create({
      data: {
        licenseKey,
        productId,
        status: 'active',
        jvzooTransactionId,
        jvzooReceiptId,
        jvzooProductId,
        transactionType,
        purchaseDate: new Date(),
        purchaseAmount,
        isRecurring,
        userId,
        maxActivations: getMaxActivations(productId),
        expiryDate: getExpiryDate(productId, isRecurring)
      }
    });

    return license;
  } catch (error) {
    console.error('Error creating license:', error);
    throw error;
  }
}

/**
 * Validate a license key
 */
export async function validateLicense(licenseKey, email) {
  try {
    const license = await prisma.license.findUnique({
      where: { licenseKey },
      include: { user: true }
    });

    if (!license) {
      return { valid: false, reason: 'License key not found' };
    }

    if (license.user.email !== email) {
      return { valid: false, reason: 'License key does not match email' };
    }

    if (license.status !== 'active') {
      return { valid: false, reason: `License is ${license.status}` };
    }

    if (license.expiryDate && new Date() > license.expiryDate) {
      return { valid: false, reason: 'License has expired' };
    }

    // Update last validated timestamp
    await prisma.license.update({
      where: { id: license.id },
      data: { lastValidated: new Date() }
    });

    return {
      valid: true,
      license: {
        productId: license.productId,
        purchaseDate: license.purchaseDate,
        expiryDate: license.expiryDate,
        isRecurring: license.isRecurring
      }
    };
  } catch (error) {
    console.error('Error validating license:', error);
    return { valid: false, reason: 'Validation error' };
  }
}

/**
 * Handle refund - deactivate license
 */
export async function handleRefund(jvzooTransactionId) {
  try {
    const license = await prisma.license.findUnique({
      where: { jvzooTransactionId }
    });

    if (!license) {
      console.warn(`License not found for refund: ${jvzooTransactionId}`);
      return null;
    }

    const updated = await prisma.license.update({
      where: { id: license.id },
      data: {
        status: 'refunded',
        refundedAt: new Date()
      }
    });

    return updated;
  } catch (error) {
    console.error('Error handling refund:', error);
    throw error;
  }
}

/**
 * Handle chargeback - deactivate license
 */
export async function handleChargeback(jvzooTransactionId) {
  try {
    const license = await prisma.license.findUnique({
      where: { jvzooTransactionId }
    });

    if (!license) {
      console.warn(`License not found for chargeback: ${jvzooTransactionId}`);
      return null;
    }

    const updated = await prisma.license.update({
      where: { id: license.id },
      data: {
        status: 'chargeback',
        chargebackAt: new Date()
      }
    });

    return updated;
  } catch (error) {
    console.error('Error handling chargeback:', error);
    throw error;
  }
}

/**
 * Handle recurring payment
 */
export async function handleRecurringPayment(jvzooTransactionId, nextBillingDate) {
  try {
    const license = await prisma.license.findUnique({
      where: { jvzooTransactionId }
    });

    if (!license) {
      console.warn(`License not found for recurring payment: ${jvzooTransactionId}`);
      return null;
    }

    const updated = await prisma.license.update({
      where: { id: license.id },
      data: {
        lastPaymentDate: new Date(),
        paymentCount: { increment: 1 },
        nextBillingDate,
        status: 'active' // Ensure it's active
      }
    });

    return updated;
  } catch (error) {
    console.error('Error handling recurring payment:', error);
    throw error;
  }
}

/**
 * Handle subscription cancellation
 */
export async function handleCancellation(jvzooTransactionId) {
  try {
    const license = await prisma.license.findUnique({
      where: { jvzooTransactionId }
    });

    if (!license) {
      console.warn(`License not found for cancellation: ${jvzooTransactionId}`);
      return null;
    }

    const updated = await prisma.license.update({
      where: { id: license.id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date()
      }
    });

    return updated;
  } catch (error) {
    console.error('Error handling cancellation:', error);
    throw error;
  }
}

/**
 * Get max activations based on product tier
 */
function getMaxActivations(productId) {
  const activationLimits = {
    'frontend': 1,            // Base license - 1 activation
    'pro_license': 3,         // Pro - 3 activations
    'templates_license': 1,   // Templates - 1 activation
    'agency_license': 10,     // Agency - 10 activations
    'reseller_license': 50,   // Reseller - 50 activations
    'fastpass_bundle': 10,    // FastPass Bundle - 10 activations
    'elite_bundle': 10,       // Elite Bundle Deal - 10 activations
    'default': 1
  };

  return activationLimits[productId] || activationLimits['default'];
}

/**
 * Get expiry date based on product
 */
function getExpiryDate(productId, isRecurring) {
  if (isRecurring) {
    // Recurring subscriptions expire after 1 month + grace period
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    expiryDate.setDate(expiryDate.getDate() + 7); // 7 day grace period
    return expiryDate;
  }

  // Lifetime licenses don't expire (return null)
  return null;
}
