import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDemoUser() {
  try {
    const email = 'isfanbogdan@gmail.com';
    const password = 'WEbmaster10@@';
    const name = 'Demo User';

    console.log('🔍 Checking if demo user exists...');

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('👤 Demo user already exists. Updating password...');

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update user with new password
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      });

      console.log('✅ Demo user password updated successfully!');
    } else {
      console.log('➕ Creating new demo user...');

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create demo user
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          emailVerified: true,
          company: 'AdGenius AI Demo'
        }
      });

      console.log('✅ Demo user created successfully!');
    }

    console.log('\n📋 Demo Login Credentials:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('\n🚀 You can now login with these credentials!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoUser();
