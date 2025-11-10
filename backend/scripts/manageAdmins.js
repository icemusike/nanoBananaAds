/**
 * Admin User Management Script
 *
 * Usage:
 * node scripts/manageAdmins.js create adrian@adgeniusai.io "Adrian" admin123
 * node scripts/manageAdmins.js list
 * node scripts/manageAdmins.js delete adrian@adgeniusai.io
 */

import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createUser(email, name, password, role = 'admin') {
  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      console.log(`❌ User with email ${email} already exists!`);
      console.log(`User ID: ${existing.id}`);
      console.log(`Name: ${existing.name}`);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        emailVerified: true,
        createdVia: 'manual',
        settings: {
          role: role, // Store role in settings JSON
          isAdmin: true,
          createdBy: 'admin-script'
        }
      }
    });

    console.log(`✅ Successfully created ${role} user!`);
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log(`User ID: ${user.id}`);
    console.log(`Role: ${role}`);
    console.log(`\n🔑 Login Credentials:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`\n⚠️  Change this password after first login!`);

  } catch (error) {
    console.error('❌ Error creating user:', error.message);
  }
}

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        emailVerified: true,
        settings: true,
        adsGenerated: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`\n📋 Total Users: ${users.length}\n`);

    users.forEach((user, index) => {
      const isAdmin = user.settings?.isAdmin || false;
      const role = user.settings?.role || 'user';

      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Role: ${role} ${isAdmin ? '👑 ADMIN' : ''}`);
      console.log(`   Verified: ${user.emailVerified ? '✅' : '❌'}`);
      console.log(`   Ads Generated: ${user.adsGenerated}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error listing users:', error.message);
  }
}

async function deleteUser(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log(`❌ User with email ${email} not found!`);
      return;
    }

    await prisma.user.delete({
      where: { email }
    });

    console.log(`✅ Successfully deleted user: ${user.name} (${email})`);

  } catch (error) {
    console.error('❌ Error deleting user:', error.message);
  }
}

async function promoteToAdmin(email) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: {
        settings: {
          role: 'super-admin',
          isAdmin: true,
          promotedAt: new Date().toISOString()
        }
      }
    });

    console.log(`✅ Successfully promoted ${user.name} to SUPER ADMIN!`);

  } catch (error) {
    console.error('❌ Error promoting user:', error.message);
  }
}

// Main execution
const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];
const arg3 = process.argv[5];

(async () => {
  try {
    switch (command) {
      case 'create':
        if (!arg1 || !arg2 || !arg3) {
          console.log('Usage: node scripts/manageAdmins.js create <email> <name> <password> [role]');
          console.log('Example: node scripts/manageAdmins.js create admin@example.com "Admin User" password123 admin');
          process.exit(1);
        }
        await createUser(arg1, arg2, arg3, process.argv[6] || 'admin');
        break;

      case 'list':
        await listUsers();
        break;

      case 'delete':
        if (!arg1) {
          console.log('Usage: node scripts/manageAdmins.js delete <email>');
          process.exit(1);
        }
        await deleteUser(arg1);
        break;

      case 'promote':
        if (!arg1) {
          console.log('Usage: node scripts/manageAdmins.js promote <email>');
          process.exit(1);
        }
        await promoteToAdmin(arg1);
        break;

      default:
        console.log('Available commands:');
        console.log('  create <email> <name> <password> [role] - Create a new admin user');
        console.log('  list                                     - List all users');
        console.log('  delete <email>                          - Delete a user');
        console.log('  promote <email>                         - Promote user to super admin');
        console.log('');
        console.log('Examples:');
        console.log('  node scripts/manageAdmins.js create adrian@adgeniusai.io "Adrian" SecurePass123 admin');
        console.log('  node scripts/manageAdmins.js create harpreetvk@adgeniusai.io "Harpreet" SuperPass123 super-admin');
        console.log('  node scripts/manageAdmins.js list');
        console.log('  node scripts/manageAdmins.js promote adrian@adgeniusai.io');
    }
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
})();
