import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin() {
  try {
    const email = 'isfanbogdan@gmail.com';
    const password = 'NanoBanana2024!';

    console.log('Testing login for:', email);
    console.log('Password to test:', password);
    console.log('');

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found in database');
    console.log('User ID:', user.id);
    console.log('User email:', user.email);
    console.log('User name:', user.name);
    console.log('Has password:', user.password ? 'Yes' : 'No');
    console.log('');

    if (!user.password) {
      console.log('❌ User has no password set');
      return;
    }

    // Test password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (isValidPassword) {
      console.log('✅ Password is CORRECT');
      console.log('');
      console.log('Login should work with:');
      console.log('Email:', email);
      console.log('Password:', password);
    } else {
      console.log('❌ Password is INCORRECT');
      console.log('');
      console.log('Stored hash:', user.password.substring(0, 20) + '...');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
