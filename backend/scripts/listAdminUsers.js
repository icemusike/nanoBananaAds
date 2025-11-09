/**
 * List all users as they would appear in admin panel
 */

import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function listUsers() {
  console.log('\n📊 AdGenius AI - Admin User List\n');
  console.log('=' .repeat(80));

  try {
    const users = await prisma.user.findMany({
      include: {
        licenses: {
          include: {
            addons: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (users.length === 0) {
      console.log('\n⚠️  No users found in the system.\n');
      return;
    }

    console.log(`\n✅ Found ${users.length} user(s)\n`);

    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name || 'Unnamed User'}`);
      console.log('   ' + '-'.repeat(76));
      console.log(`   Email:           ${user.email}`);
      console.log(`   ID:              ${user.id}`);
      console.log(`   Created Via:     ${user.createdVia || 'manual'}`);
      console.log(`   Email Verified:  ${user.emailVerified ? '✓' : '✗'}`);
      console.log(`   Created:         ${user.createdAt.toLocaleString()}`);
      console.log(`   Last Login:      ${user.lastLoginAt?.toLocaleString() || 'Never'}`);

      // JVZoo info
      if (user.jvzooCustomerId) {
        console.log(`   JVZoo Customer:  ${user.jvzooCustomerId}`);
        console.log(`   JVZoo Trans ID:  ${user.jvzooTransactionId || 'N/A'}`);
      }

      // License info
      if (user.licenses && user.licenses.length > 0) {
        const activeLicenses = user.licenses.filter(l => l.status === 'active');
        const totalLicenses = user.licenses.length;

        console.log(`   Licenses:        ${activeLicenses.length} active / ${totalLicenses} total`);

        user.licenses.forEach((license) => {
          const statusIcon = license.status === 'active' ? '✓' : '✗';
          const creditsInfo = license.creditsTotal
            ? `${license.creditsTotal - license.creditsUsed}/${license.creditsTotal}`
            : 'Unlimited';

          console.log(`     ${statusIcon} ${license.licenseTier.toUpperCase()} - ${creditsInfo} credits - Key: ${license.licenseKey}`);

          if (license.addons && license.addons.length > 0) {
            license.addons.forEach((addon) => {
              const addonIcon = addon.status === 'active' ? '✓' : '✗';
              console.log(`       ${addonIcon} Addon: ${addon.addonType}`);
            });
          }
        });
      } else {
        console.log(`   Licenses:        ⚠️  None`);
      }
    });

    console.log('\n' + '=' .repeat(80));

    // Summary statistics
    const totalUsers = users.length;
    const jvzooUsers = users.filter(u => u.createdVia === 'jvzoo').length;
    const verifiedUsers = users.filter(u => u.emailVerified).length;
    const usersWithLicenses = users.filter(u => u.licenses?.length > 0).length;

    console.log('\n📈 Summary:');
    console.log(`   Total Users:         ${totalUsers}`);
    console.log(`   JVZoo Purchases:     ${jvzooUsers}`);
    console.log(`   Verified Emails:     ${verifiedUsers}`);
    console.log(`   Users with License:  ${usersWithLicenses}`);

    // License tier breakdown
    const licenseStats = {};
    users.forEach(user => {
      user.licenses?.forEach(license => {
        if (license.status === 'active') {
          licenseStats[license.licenseTier] = (licenseStats[license.licenseTier] || 0) + 1;
        }
      });
    });

    if (Object.keys(licenseStats).length > 0) {
      console.log('\n   License Tiers:');
      Object.entries(licenseStats).forEach(([tier, count]) => {
        console.log(`     - ${tier}: ${count}`);
      });
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
