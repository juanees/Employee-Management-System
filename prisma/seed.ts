import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  const leader = await prisma.employee.upsert({
    where: { email: 'carla.lead@example.com' },
    update: {},
    create: {
      dni: '10000001',
      firstName: 'Carla',
      lastName: 'Lead',
      email: 'carla.lead@example.com',
      taxStatus: 'registered',
      status: 'active',
      hiredAt: new Date('2020-02-01T00:00:00.000Z')
    }
  });

  const specialist = await prisma.employee.upsert({
    where: { email: 'miguel.ops@example.com' },
    update: {},
    create: {
      dni: '10000002',
      firstName: 'Miguel',
      lastName: 'Ops',
      email: 'miguel.ops@example.com',
      taxStatus: 'registered',
      status: 'active',
      hiredAt: new Date('2021-06-15T00:00:00.000Z')
    }
  });

  const jobTitle = 'Compliance & Travel Ops';
  const existingJob = await prisma.job.findFirst({ where: { title: jobTitle } });

  if (!existingJob) {
    await prisma.job.create({
      data: {
        title: jobTitle,
        description: 'Oversees fleet compliance and employee travel readiness.',
        leaderId: leader.id,
        assignments: {
          create: [
            { employeeId: leader.id, role: 'leader' },
            { employeeId: specialist.id, role: 'member' }
          ]
        }
      }
    });
  }

  const templateTitle = 'Global Mobility Template';
  const template = await prisma.jobTemplate.findFirst({ where: { title: templateTitle } });
  if (!template) {
    await prisma.jobTemplate.create({
      data: {
        title: templateTitle,
        description: 'Reusable blueprint for mobility and travel coordination teams.',
        defaultRoles: JSON.stringify(['planner', 'liaison'])
      }
    });
  }

  console.log('Seed completed successfully');
}

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
