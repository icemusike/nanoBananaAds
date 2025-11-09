import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setUserPassword() {
  try {
    const email = 'isfanbogdan@gmail.com';
    const password = 'WEbmaster10@@'; // Updated password

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log(`User ${email} not found in database`);
      return;
    }

    console.log(`Found user: ${user.email}`);
    console.log(`Current password set: ${user.password ? 'Yes' : 'No'}`);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        name: user.name || 'Bogdan Isfan' // Set name if not set
      }
    });

    console.log('\n✅ Password updated successfully!');
    console.log('\nLogin Credentials:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('\nPlease change this password after logging in.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setUserPassword();
