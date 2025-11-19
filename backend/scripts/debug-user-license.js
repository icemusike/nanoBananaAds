import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function checkUser() {
  const email = 'isfanbogdan@gmail.com';
  console.log(`Checking user: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
    include: { 
      licenses: true
    }
  });

  if (!user) {
    console.log('User not found!');
    return;
  }

  console.log('User ID:', user.id);
  console.log('Credits Used Period:', user.creditsUsedPeriod);
  console.log('Next Reset:', user.nextCreditReset);
  console.log('Licenses:', user.licenses.length);

  user.licenses.forEach(l => {
    console.log(`- License ID: ${l.id}`);
    console.log(`  Product ID: ${l.productId}`);
    console.log(`  Status: ${l.status}`);
    console.log(`  Credits Allocated: ${l.creditsAllocated}`);
    console.log(`  Is Unlimited? ${l.creditsAllocated === -1}`);
  });

  // Check entitlements logic simulation
  const hasUnlimited = user.licenses.some(l => l.creditsAllocated === -1 && l.status === 'active');
  const totalCredits = user.licenses
    .filter(l => l.status === 'active' && l.creditsAllocated > 0)
    .reduce((sum, l) => sum + l.creditsAllocated, 0);

  console.log('--- Entitlements Calculation ---');
  console.log('Has Unlimited:', hasUnlimited);
  console.log('Total Credits (Limited):', totalCredits);
}

checkUser()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());

