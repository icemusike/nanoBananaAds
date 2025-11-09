/**
 * Check if user exists in database
 */

import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function checkUser(email) {
  console.log(`\n🔍 Checking for user: ${email}\n`);

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        licenses: {
          include: {
            addons: true
          }
        }
      }
    });

    if (!user) {
      console.log('❌ User not found!\n');
      return;
    }

    console.log('✅ User found!');
    console.log('=' .repeat(60));
    console.log('\n👤 User Details:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Created Via:', user.createdVia);
    console.log('  Email Verified:', user.emailVerified);
    console.log('  JVZoo Customer ID:', user.jvzooCustomerId);
    console.log('  JVZoo Transaction ID:', user.jvzooTransactionId);
    console.log('  Created At:', user.createdAt);

    if (user.licenses && user.licenses.length > 0) {
      console.log('\n📜 Licenses:');

      user.licenses.forEach((license, index) => {
        console.log(`\n  License ${index + 1}:`);
        console.log('    ID:', license.id);
        console.log('    Key:', license.licenseKey);
        console.log('    Tier:', license.licenseTier);
        console.log('    Status:', license.status);
        console.log('    Credits Total:', license.creditsTotal || 'Unlimited');
        console.log('    Credits Used:', license.creditsUsed);
        console.log('    Credits Remaining:', license.creditsTotal ? license.creditsTotal - license.creditsUsed : 'Unlimited');
        console.log('    Reset Date:', license.creditsResetDate);
        console.log('    JVZoo Product ID:', license.jvzooProductId);
        console.log('    JVZoo Transaction ID:', license.jvzooTransactionId);
        console.log('    Purchase Amount:', license.purchaseAmount);
        console.log('    Created At:', license.createdAt);

        if (license.addons && license.addons.length > 0) {
          console.log('    Addons:');
          license.addons.forEach((addon) => {
            console.log(`      - ${addon.addonType} (${addon.status})`);
          });
        } else {
          console.log('    Addons: None');
        }
      });
    } else {
      console.log('\n⚠️  No licenses found for this user!');
    }

    console.log('\n' + '=' .repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line or use default
const email = process.argv[2] || 'jvzootest@example.com';
checkUser(email);
