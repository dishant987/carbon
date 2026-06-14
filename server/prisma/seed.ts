import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

/**
 * Seeds the database with a demo user and sample activity data.
 */
async function main(): Promise<void> {
  const passwordHash = await hashPassword('DemoPassword123');

  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      passwordHash,
      name: 'Demo User',
    },
  });

  const sampleActivities = [
    { type: 'transport', category: 'car', amount: 15, unit: 'km', footprint: 3.45, date: new Date() },
    { type: 'food', category: 'beef', amount: 0.5, unit: 'kg', footprint: 7.5, date: new Date() },
    { type: 'energy', category: 'electricity', amount: 10, unit: 'kWh', footprint: 4.2, date: new Date() },
    { type: 'shopping', category: 'clothing', amount: 2, unit: 'items', footprint: 1.8, date: new Date() },
    { type: 'transport', category: 'bus', amount: 8, unit: 'km', footprint: 0.56, date: new Date(Date.now() - 86400000) },
    { type: 'food', category: 'vegetables', amount: 1, unit: 'kg', footprint: 0.4, date: new Date(Date.now() - 86400000) },
  ];

  for (const activity of sampleActivities) {
    await prisma.activity.create({
      data: { ...activity, userId: user.id },
    });
  }

  console.log('Seeded database with demo user and sample activities.');
  console.log('Demo login: demo@example.com / DemoPassword123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
