import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Admin user credentials - CHANGE THESE!
    const email = process.env.ADMIN_EMAIL || 'admin@nanobananacreator.com';
    const password = process.env.ADMIN_PASSWORD || 'ChangeThisPassword123!';
    const name = process.env.ADMIN_NAME || 'Super Admin';

    console.log('Creating admin user...');
    console.log('Email:', email);
    console.log('Name:', name);

    // Check if admin already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      console.log('❌ Admin user with this email already exists!');
      console.log('Admin ID:', existingAdmin.id);
      console.log('Admin Name:', existingAdmin.name);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await prisma.adminUser.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'super_admin',
        isActive: true
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('-----------------------------------');
    console.log('Admin ID:', admin.id);
    console.log('Email:', admin.email);
    console.log('Name:', admin.name);
    console.log('Role:', admin.role);
    console.log('Created:', admin.createdAt);
    console.log('-----------------------------------');
    console.log('\n🔐 You can now login with:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('\n⚠️  IMPORTANT: Change the default password after first login!');
    console.log('⚠️  Set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_NAME in .env for custom credentials');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('\n✨ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
