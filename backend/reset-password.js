import { PrismaClient } from './generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const email = 'isfanbogdan@gmail.com';
    const newPassword = 'Admin123!'; // Change this to your desired password

    console.log(`\n🔄 Resetting password for: ${email}`);

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      console.log(`❌ User not found with email: ${email}`);
      console.log('\n💡 Available users in database:');
      const allUsers = await prisma.user.findMany({
        select: { id: true, email: true, name: true }
      });
      console.table(allUsers);
      return;
    }

    console.log(`✅ User found: ${user.name} (ID: ${user.id})`);

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    console.log(`\n✅ Password successfully reset!`);
    console.log(`\n📋 Login Credentials:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${newPassword}`);
    console.log(`\n⚠️  Please change this password after logging in!\n`);

  } catch (error) {
    console.error('❌ Error resetting password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
