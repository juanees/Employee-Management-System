"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_crypto_1 = require("node:crypto");
const vitest_1 = require("vitest");
const travel_service_1 = require("../src/modules/travel/travel.service");
const employee_service_1 = require("../src/modules/employees/employee.service");
const travelService = new travel_service_1.TravelService();
const employeeService = new employee_service_1.EmployeeService();
const buildEmployee = async () => employeeService.create({
    dni: `${Math.floor(Math.random() * 1000000000)}`,
    firstName: 'Traveler',
    lastName: 'Example',
    email: `traveler+${(0, node_crypto_1.randomUUID)()}@example.com`,
    taxStatus: 'registered',
    status: 'active',
    hiredAt: new Date().toISOString()
});
const futureStart = new Date('2030-01-01T09:00:00.000Z').toISOString();
const futureEnd = new Date('2030-01-05T09:00:00.000Z').toISOString();
(0, vitest_1.describe)('TravelService', () => {
    (0, vitest_1.it)('creates travel requests in pending state', async () => {
        const employee = await buildEmployee();
        const request = await travelService.create({
            employeeId: employee.id,
            origin: 'HQ',
            destination: 'Client Site',
            startDate: futureStart,
            endDate: futureEnd,
            purpose: 'Implementation'
        });
        (0, vitest_1.expect)(request.status).toBe('pending_approval');
        (0, vitest_1.expect)(request.id).toBeDefined();
    });
    (0, vitest_1.it)('throws when end date is before start', async () => {
        const employee = await buildEmployee();
        await (0, vitest_1.expect)(travelService.create({
            employeeId: employee.id,
            origin: 'HQ',
            destination: 'Client',
            startDate: futureStart,
            endDate: new Date('2029-01-01T00:00:00.000Z').toISOString(),
            purpose: 'Audit'
        })).rejects.toThrow('End date must be after start date');
    });
    (0, vitest_1.it)('updates travel status', async () => {
        const employee = await buildEmployee();
        const request = await travelService.create({
            employeeId: employee.id,
            origin: 'HQ',
            destination: 'Client Site',
            startDate: futureStart,
            endDate: futureEnd,
            purpose: 'Implementation'
        });
        const updated = await travelService.updateStatus(request.id, {
            status: 'approved',
            approverComments: 'Looks good'
        });
        (0, vitest_1.expect)(updated?.status).toBe('approved');
        (0, vitest_1.expect)(updated?.approverComments).toBe('Looks good');
    });
});
