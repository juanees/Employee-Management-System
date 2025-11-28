"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_crypto_1 = require("node:crypto");
const vitest_1 = require("vitest");
const jobTemplate_service_1 = require("../src/modules/jobTemplates/jobTemplate.service");
const employee_service_1 = require("../src/modules/employees/employee.service");
const templateService = new jobTemplate_service_1.JobTemplateService();
const employeeService = new employee_service_1.EmployeeService();
const createEmployee = (firstName) => employeeService.create({
    dni: `${Math.floor(Math.random() * 1000000000)}`,
    firstName,
    lastName: 'Tester',
    email: `${firstName.toLowerCase()}+${(0, node_crypto_1.randomUUID)()}@example.com`,
    taxStatus: 'registered',
    status: 'active',
    hiredAt: new Date().toISOString()
});
vitest_1.describe.sequential('JobTemplateService', () => {
    (0, vitest_1.it)('creates templates and lists defaults', async () => {
        const template = await templateService.createTemplate({
            title: 'Emergency Response',
            description: 'Handles urgent travel & fleet incidents',
            defaultRoles: ['dispatcher', 'analyst']
        });
        (0, vitest_1.expect)(template.id).toBeDefined();
        (0, vitest_1.expect)(template.defaultRoles).toEqual(['dispatcher', 'analyst']);
        const templates = await templateService.listTemplates();
        (0, vitest_1.expect)(templates.length).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('instantiates a template into a job with leader and members', async () => {
        const template = await templateService.createTemplate({
            title: 'Travel Strike Team',
            defaultRoles: ['navigator', 'coordinator']
        });
        const leader = await createEmployee('Leader');
        const memberA = await createEmployee('MemberA');
        const memberB = await createEmployee('MemberB');
        const job = await templateService.instantiate(template.id, {
            leaderId: leader.id,
            memberAssignments: [
                { employeeId: memberA.id },
                { employeeId: memberB.id, role: 'field-ops' }
            ]
        });
        (0, vitest_1.expect)(job.template?.id).toBe(template.id);
        (0, vitest_1.expect)(job.leaderId).toBe(leader.id);
        (0, vitest_1.expect)(job.assignments).toHaveLength(3);
        (0, vitest_1.expect)(job.assignments.find((assignment) => assignment.employeeId === memberA.id)?.role).toBe('navigator');
        (0, vitest_1.expect)(job.assignments.find((assignment) => assignment.employeeId === memberB.id)?.role).toBe('field-ops');
    });
});
