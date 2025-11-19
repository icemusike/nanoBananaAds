import { PrismaClient } from '../generated/prisma/index.js';
import { PRODUCT_MAPPING } from '../config/productMapping.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🍌 Starting License Fix Script...');

  // 1. Fix Licenses (Backfill creditsAllocated)
  const licenses = await prisma.license.findMany();
  console.log(`Found ${licenses.length} licenses to check.`);

  for (const license of licenses) {
    // Find config for this product ID
    let config = null;
    
    // Try finding by Internal ID match
    const internalMatch = Object.values(PRODUCT_MAPPING).find(p => p.id === license.productId);
    
    if (internalMatch) {
      config = internalMatch;
    } else if (PRODUCT_MAPPING[license.productId]) {
      config = PRODUCT_MAPPING[license.productId];
    }

    // Default for 'frontend' if somehow missing from mapping but present in DB
    if (!config && license.productId === 'frontend') {
        config = { credits: 500 };
    }

    if (config) {
      const correctCredits = config.credits;
      
      // Only update if different (default was 0, correct might be 500 or -1)
      if (license.creditsAllocated !== correctCredits) {
        console.log(`Fixing License ${license.id} (${license.productId}): ${license.creditsAllocated} -> ${correctCredits}`);
        await prisma.license.update({
          where: { id: license.id },
          data: { creditsAllocated: correctCredits }
        });
      }
    } else {
      console.warn(`⚠️ Unknown product ID for license ${license.id}: ${license.productId}`);
    }
  }

  // 2. Initialize User Credit Tracking
  const users = await prisma.user.findMany();
  console.log(`Checking ${users.length} users...`);

  for (const user of users) {
    // If nextCreditReset is null, initialize it
    if (!user.nextCreditReset) {
        console.log(`Initializing credit cycle for user: ${user.email}`);
        
        const nextReset = new Date();
        nextReset.setDate(1);
        nextReset.setMonth(nextReset.getMonth() + 1);
        nextReset.setHours(0, 0, 0, 0);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                nextCreditReset: nextReset,
                creditsUsedPeriod: 0 
            }
        });
    }
  }

  console.log('✅ Fix complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

