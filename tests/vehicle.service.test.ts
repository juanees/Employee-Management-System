import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { VehicleService } from '../src/modules/fleet/vehicle.service';
import { EmployeeService } from '../src/modules/employees/employee.service';

const vehicleService = new VehicleService();
const employeeService = new EmployeeService();

const createEmployee = () =>
  employeeService.create({
    dni: `${Math.floor(Math.random() * 1_000_000_000)}`,
    firstName: 'Fleet',
    lastName: 'Tester',
    email: `fleet+${randomUUID()}@example.com`,
    taxStatus: 'registered',
    status: 'active',
    hiredAt: new Date().toISOString()
  });

const createVehicle = (overrides?: Partial<Parameters<typeof vehicleService.create>[0]>) =>
  vehicleService.create({
    plateNumber: `TEST-${Math.floor(Math.random() * 1_000_000)}`,
    model: 'Sprinter',
    year: 2022,
    insuranceExpiresOn: new Date('2030-01-01T00:00:00.000Z').toISOString(),
    vtvExpiresOn: new Date('2030-06-01T00:00:00.000Z').toISOString(),
    status: 'available',
    ...overrides
  });

describe('VehicleService.assignEmployee', () => {
  it('assigns an employee and updates status when available', async () => {
    const employee = await createEmployee();
    const vehicle = await createVehicle();

    const updated = await vehicleService.assignEmployee(vehicle.id, employee.id);

    expect(updated?.assignedEmployeeId).toBe(employee.id);
    expect(updated?.status).toBe('assigned');
  });

  it('unassigns employees and resets status to available', async () => {
    const employee = await createEmployee();
    const vehicle = await createVehicle();
    await vehicleService.assignEmployee(vehicle.id, employee.id);

    const updated = await vehicleService.assignEmployee(vehicle.id, null);

    expect(updated?.assignedEmployeeId).toBeUndefined();
    expect(updated?.status).toBe('available');
  });

  it('throws when vehicle is out of service', async () => {
    const employee = await createEmployee();
    const vehicle = await createVehicle({ status: 'maintenance' });

    await expect(vehicleService.assignEmployee(vehicle.id, employee.id)).rejects.toThrow(
      'Vehicle cannot be reassigned while out of service'
    );

    const persisted = await vehicleService.findById(vehicle.id);
    expect(persisted?.status).toBe('maintenance');
    expect(persisted?.assignedEmployeeId).toBeUndefined();
  });
});
