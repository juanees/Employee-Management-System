"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_crypto_1 = require("node:crypto");
const vitest_1 = require("vitest");
const job_service_1 = require("../src/modules/jobs/job.service");
const employee_service_1 = require("../src/modules/employees/employee.service");
const jobService = new job_service_1.JobService();
const employeeService = new employee_service_1.EmployeeService();
const createEmployee = () => employeeService.create({
    dni: `${Math.floor(Math.random() * 1000000000)}`,
    firstName: 'Test',
    lastName: 'User',
    email: `test+${(0, node_crypto_1.randomUUID)()}@example.com`,
    taxStatus: 'registered',
    status: 'active',
    hiredAt: new Date().toISOString()
});
vitest_1.describe.sequential('JobService', () => {
    (0, vitest_1.it)('creates job with leader and members', async () => {
        const leader = await createEmployee();
        const member = await createEmployee();
        const job = await jobService.create({
            title: 'Platform Team',
            description: 'Handles core services',
            leaderId: leader.id,
            memberIds: [member.id]
        });
        (0, vitest_1.expect)(job.leaderId).toBe(leader.id);
        (0, vitest_1.expect)(job.assignments).toHaveLength(2);
        (0, vitest_1.expect)(job.assignments.find((assignment) => assignment.employeeId === leader.id)?.role).toBe('leader');
        (0, vitest_1.expect)(job.assignments.find((assignment) => assignment.employeeId === member.id)?.role).toBe('member');
    });
    (0, vitest_1.it)('adds additional members to an existing job', async () => {
        const leader = await createEmployee();
        const memberA = await createEmployee();
        const memberB = await createEmployee();
        const job = await jobService.create({
            title: 'Travel Ops',
            leaderId: leader.id,
            memberIds: [memberA.id]
        });
        const updated = await jobService.addMembers(job.id, { employeeIds: [memberB.id] });
        (0, vitest_1.expect)(updated.assignments).toHaveLength(3);
        (0, vitest_1.expect)(updated.assignments.find((assignment) => assignment.employeeId === memberB.id)?.role).toBe('member');
    });
});
