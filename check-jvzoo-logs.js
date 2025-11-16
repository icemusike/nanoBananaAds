import { PrismaClient } from './backend/generated/prisma/index.js';

const prisma = new PrismaClient();

async function checkJVZooLogs() {
  try {
    console.log('\n=== Checking JVZoo Transaction Logs ===\n');

    // Get all JVZoo transactions
    const transactions = await prisma.jVZooTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: {
          select: {
            email: true,
            name: true,
            createdVia: true
          }
        }
      }
    });

    if (transactions.length === 0) {
      console.log('❌ NO JVZoo transactions found in database!');
      console.log('\nPossible issues:');
      console.log('1. Backend server not running');
      console.log('2. IPN URL incorrect in JVZoo');
      console.log('3. Firewall blocking JVZoo requests');
      console.log('4. ngrok tunnel not active (if testing locally)');
      return;
    }

    console.log(`✅ Found ${transactions.length} transaction(s):\n`);

    transactions.forEach((tx, index) => {
      console.log(`\n[${index + 1}] Transaction ID: ${tx.jvzooTransactionId}`);
      console.log(`    Receipt ID: ${tx.jvzooReceiptId || 'N/A'}`);
      console.log(`    Type: ${tx.transactionType}`);
      console.log(`    Product ID: ${tx.jvzooProductId}`);
      console.log(`    Customer: ${tx.customerName} (${tx.customerEmail})`);
      console.log(`    Amount: $${tx.amount || 0}`);
      console.log(`    Verified: ${tx.verified ? '✅ YES' : '❌ NO'}`);
      console.log(`    Processed: ${tx.processed ? '✅ YES' : '❌ NO'}`);

      if (tx.processedAt) {
        console.log(`    Processed At: ${tx.processedAt}`);
      }

      if (tx.processingError) {
        console.log(`    ⚠️ ERROR: ${tx.processingError}`);
      }

      if (tx.user) {
        console.log(`    User Created: ✅ ${tx.user.email} (${tx.user.createdVia})`);
      } else {
        console.log(`    User Created: ❌ NO`);
      }

      console.log(`    Created At: ${tx.createdAt}`);

      // Show raw IPN data for debugging
      if (!tx.processed || tx.processingError) {
        console.log(`    Raw IPN Data:`, JSON.stringify(tx.rawIpnData, null, 2));
      }
    });

    // Check for users created via JVZoo
    console.log('\n\n=== Users Created via JVZoo ===\n');
    const jvzooUsers = await prisma.user.findMany({
      where: { createdVia: 'jvzoo' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        licenses: true
      }
    });

    if (jvzooUsers.length === 0) {
      console.log('❌ No users created via JVZoo yet');
    } else {
      console.log(`✅ Found ${jvzooUsers.length} user(s) created via JVZoo:\n`);
      jvzooUsers.forEach((user, index) => {
        console.log(`[${index + 1}] ${user.name} (${user.email})`);
        console.log(`    Created: ${user.createdAt}`);
        console.log(`    Licenses: ${user.licenses.length}`);
        user.licenses.forEach(license => {
          console.log(`      - ${license.productId} (${license.status}) - Key: ${license.licenseKey}`);
        });
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error checking logs:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkJVZooLogs();
