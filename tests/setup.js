"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const vitest_1 = require("vitest");
const prisma_1 = require("../src/lib/prisma");
(0, vitest_1.beforeEach)(async () => {
    await prisma_1.prisma.jobAssignment.deleteMany();
    await prisma_1.prisma.job.deleteMany();
    await prisma_1.prisma.jobTemplate.deleteMany();
    await prisma_1.prisma.travelRequest.deleteMany();
    await prisma_1.prisma.vehicle.deleteMany();
    await prisma_1.prisma.role.deleteMany();
    await prisma_1.prisma.employee.deleteMany();
});
(0, vitest_1.afterAll)(async () => {
    await prisma_1.prisma.$disconnect();
});
