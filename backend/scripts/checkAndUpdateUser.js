import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkAndUpdateUser() {
  try {
    const email = 'isfanbogdan@gmail.com';
    const password = 'WEbmaster10@@';

    console.log('Checking database connection...');

    // List all users
    const allUsers = await prisma.user.findMany();
    console.log('\n📊 Total users in database:', allUsers.length);

    if (allUsers.length > 0) {
      console.log('\nUsers found:');
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Has Password: ${user.password ? 'Yes' : 'No'}`);
        console.log('');
      });
    }

    // Find specific user
    console.log(`\nLooking for user: ${email}`);
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      console.log('❌ User not found. Creating new user...');

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name: 'Bogdan Isfan',
          password: hashedPassword
        }
      });

      console.log('✅ User created successfully!');
    } else {
      console.log('✅ User found!');
      console.log('User ID:', user.id);
      console.log('User email:', user.email);
      console.log('User name:', user.name);

      // Update password
      console.log('\nUpdating password...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: {
          password: hashedPassword
        }
      });

      console.log('✅ Password updated!');
    }

    // Verify the password works
    console.log('\n🔐 Testing password...');
    const isValid = await bcrypt.compare(password, user.password);

    if (isValid) {
      console.log('✅ Password verification SUCCESSFUL!');
      console.log('\n📋 Login Credentials:');
      console.log('Email:', email);
      console.log('Password:', password);
    } else {
      console.log('❌ Password verification FAILED!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndUpdateUser();
