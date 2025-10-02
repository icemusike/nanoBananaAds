import { PrismaClient } from '../generated/prisma/index.js';
import { withAccelerate } from '@prisma/extension-accelerate';

// Create Prisma Client instance with Accelerate extension
const prisma = new PrismaClient().$extends(withAccelerate());

export default prisma;
