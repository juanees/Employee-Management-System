import 'dotenv/config';
import { beforeEach, afterAll } from 'vitest';
import { prisma } from '../src/lib/prisma';

beforeEach(async () => {
  await prisma.jobAssignment.deleteMany();
  await prisma.job.deleteMany();
  await prisma.travelRequest.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.role.deleteMany();
  await prisma.employee.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
