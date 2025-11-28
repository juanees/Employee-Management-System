"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_crypto_1 = require("node:crypto");
const vitest_1 = require("vitest");
const employee_service_1 = require("../src/modules/employees/employee.service");
const service = new employee_service_1.EmployeeService();
const buildPayload = () => ({
    dni: `${Math.floor(Math.random() * 1000000000)}`,
    firstName: 'Alice',
    lastName: 'Doe',
    email: `alice+${(0, node_crypto_1.randomUUID)()}@example.com`,
    taxStatus: 'registered',
    status: 'active',
    hiredAt: new Date().toISOString()
});
(0, vitest_1.describe)('EmployeeService', () => {
    (0, vitest_1.it)('creates employees with defaults', async () => {
        const employee = await service.create(buildPayload());
        (0, vitest_1.expect)(employee.id).toBeDefined();
        (0, vitest_1.expect)(employee.roles).toEqual([]);
        (0, vitest_1.expect)(employee.taxStatus).toBe('registered');
    });
    (0, vitest_1.it)('assigns roles without duplication', async () => {
        const employee = await service.create(buildPayload());
        const updated = await service.assignRole(employee.id, 'role-1');
        (0, vitest_1.expect)(updated?.roles).toEqual(['role-1']);
        const duplicate = await service.assignRole(employee.id, 'role-1');
        (0, vitest_1.expect)(duplicate?.roles).toEqual(['role-1']);
    });
});
