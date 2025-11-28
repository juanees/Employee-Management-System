"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_crypto_1 = require("node:crypto");
const vitest_1 = require("vitest");
const vehicle_service_1 = require("../src/modules/fleet/vehicle.service");
const employee_service_1 = require("../src/modules/employees/employee.service");
const vehicleService = new vehicle_service_1.VehicleService();
const employeeService = new employee_service_1.EmployeeService();
const createEmployee = () => employeeService.create({
    dni: `${Math.floor(Math.random() * 1000000000)}`,
    firstName: 'Fleet',
    lastName: 'Tester',
    email: `fleet+${(0, node_crypto_1.randomUUID)()}@example.com`,
    taxStatus: 'registered',
    status: 'active',
    hiredAt: new Date().toISOString()
});
const createVehicle = (overrides) => vehicleService.create({
    plateNumber: `TEST-${Math.floor(Math.random() * 1000000)}`,
    model: 'Sprinter',
    year: 2022,
    insuranceExpiresOn: new Date('2030-01-01T00:00:00.000Z').toISOString(),
    vtvExpiresOn: new Date('2030-06-01T00:00:00.000Z').toISOString(),
    status: 'available',
    ...overrides
});
(0, vitest_1.describe)('VehicleService.assignEmployee', () => {
    (0, vitest_1.it)('assigns an employee and updates status when available', async () => {
        const employee = await createEmployee();
        const vehicle = await createVehicle();
        const updated = await vehicleService.assignEmployee(vehicle.id, employee.id);
        (0, vitest_1.expect)(updated?.assignedEmployeeId).toBe(employee.id);
        (0, vitest_1.expect)(updated?.status).toBe('assigned');
    });
    (0, vitest_1.it)('unassigns employees and resets status to available', async () => {
        const employee = await createEmployee();
        const vehicle = await createVehicle();
        await vehicleService.assignEmployee(vehicle.id, employee.id);
        const updated = await vehicleService.assignEmployee(vehicle.id, null);
        (0, vitest_1.expect)(updated?.assignedEmployeeId).toBeUndefined();
        (0, vitest_1.expect)(updated?.status).toBe('available');
    });
    (0, vitest_1.it)('throws when vehicle is out of service', async () => {
        const employee = await createEmployee();
        const vehicle = await createVehicle({ status: 'maintenance' });
        await (0, vitest_1.expect)(vehicleService.assignEmployee(vehicle.id, employee.id)).rejects.toThrow('Vehicle cannot be reassigned while out of service');
        const persisted = await vehicleService.findById(vehicle.id);
        (0, vitest_1.expect)(persisted?.status).toBe('maintenance');
        (0, vitest_1.expect)(persisted?.assignedEmployeeId).toBeUndefined();
    });
});
