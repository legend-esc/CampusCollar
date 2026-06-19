import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@campuscollar.edu' },
    update: {},
    create: {
      email: 'admin@campuscollar.edu',
      name: 'Admin User',
      university: 'Campus University',
      role: 'ADMIN',
      passwordHash: '$2a$10$placeholder',
      emailVerified: true,
      trustScore: 100,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@campuscollar.edu' },
    update: {},
    create: {
      email: 'staff@campuscollar.edu',
      name: 'Staff Verifier',
      university: 'Campus University',
      role: 'STAFF',
      passwordHash: '$2a$10$placeholder',
      emailVerified: true,
      trustScore: 90,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@campuscollar.edu' },
    update: {},
    create: {
      email: 'student@campuscollar.edu',
      name: 'Test Student',
      university: 'Campus University',
      role: 'STUDENT',
      passwordHash: '$2a$10$placeholder',
      emailVerified: true,
      trustScore: 75,
    },
  });

  const badgeTypes = await Promise.all([
    prisma.badgeType.upsert({
      where: { name: 'Early Adopter' },
      update: {},
      create: {
        name: 'Early Adopter',
        description: 'One of the first users on CampusCollar',
        tier: 1,
      },
    }),
    prisma.badgeType.upsert({
      where: { name: 'Top Worker' },
      update: {},
      create: { name: 'Top Worker', description: 'Completed 10+ jobs with 5-star rating', tier: 2 },
    }),
    prisma.badgeType.upsert({
      where: { name: 'Campus Verified' },
      update: {},
      create: { name: 'Campus Verified', description: 'Verified student identity', tier: 1 },
    }),
    prisma.badgeType.upsert({
      where: { name: 'Trusted Staff' },
      update: {},
      create: { name: 'Trusted Staff', description: 'Verified staff member', tier: 3 },
    }),
  ]);

  const sampleJobs = [
    {
      title: 'Help with Calculus HW',
      description: 'Need help with integration problems',
      category: 'Tutoring',
      amount: 25,
    },
    {
      title: 'Photography for Event',
      description: 'Take photos at campus career fair',
      category: 'Photography',
      amount: 50,
    },
    {
      title: 'Dog Walk',
      description: 'Walk my golden retriever around campus',
      category: 'Pets',
      amount: 15,
    },
  ];

  for (const job of sampleJobs) {
    await prisma.job.create({
      data: {
        ...job,
        customerId: student.id,
        location: 'Main Campus',
      },
    });
  }

  console.log('Seed complete!');
  console.log(`  Users: admin, staff, student`);
  console.log(`  Badge types: ${badgeTypes.length}`);
  console.log(`  Sample jobs: ${sampleJobs.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
