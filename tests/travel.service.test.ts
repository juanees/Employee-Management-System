import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { TravelService } from '../src/modules/travel/travel.service';
import { EmployeeService } from '../src/modules/employees/employee.service';

const travelService = new TravelService();
const employeeService = new EmployeeService();

const buildEmployee = async () =>
  employeeService.create({
    dni: `${Math.floor(Math.random() * 1_000_000_000)}`,
    firstName: 'Traveler',
    lastName: 'Example',
    email: `traveler+${randomUUID()}@example.com`,
    taxStatus: 'registered',
    status: 'active',
    hiredAt: new Date().toISOString()
  });

const futureStart = new Date('2030-01-01T09:00:00.000Z').toISOString();
const futureEnd = new Date('2030-01-05T09:00:00.000Z').toISOString();

describe('TravelService', () => {
  it('creates travel requests in pending state', async () => {
    const employee = await buildEmployee();
    const request = await travelService.create({
      employeeId: employee.id,
      origin: 'HQ',
      destination: 'Client Site',
      startDate: futureStart,
      endDate: futureEnd,
      purpose: 'Implementation'
    });

    expect(request.status).toBe('pending_approval');
    expect(request.id).toBeDefined();
  });

  it('throws when end date is before start', async () => {
    const employee = await buildEmployee();
    await expect(
      travelService.create({
        employeeId: employee.id,
        origin: 'HQ',
        destination: 'Client',
        startDate: futureStart,
        endDate: new Date('2029-01-01T00:00:00.000Z').toISOString(),
        purpose: 'Audit'
      })
    ).rejects.toThrow('End date must be after start date');
  });

  it('updates travel status', async () => {
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

    expect(updated?.status).toBe('approved');
    expect(updated?.approverComments).toBe('Looks good');
  });

  it('updates travel details and status with validation', async () => {
    const employee = await buildEmployee();
    const request = await travelService.create({
      employeeId: employee.id,
      origin: 'HQ',
      destination: 'Client Site',
      startDate: futureStart,
      endDate: futureEnd,
      purpose: 'Implementation'
    });

    const updated = await travelService.updateDetails(request.id, {
      destination: 'Remote Office',
      status: 'approved',
      approverComments: 'Go ahead'
    });

    expect(updated?.destination).toBe('Remote Office');
    expect(updated?.status).toBe('approved');
    expect(updated?.approverComments).toBe('Go ahead');
  });

  it('deletes travel requests and reports missing ones', async () => {
    const employee = await buildEmployee();
    const request = await travelService.create({
      employeeId: employee.id,
      origin: 'HQ',
      destination: 'Client Site',
      startDate: futureStart,
      endDate: futureEnd,
      purpose: 'Implementation'
    });

    const deleted = await travelService.delete(request.id);
    expect(deleted).toBe(true);
    const secondAttempt = await travelService.delete(request.id);
    expect(secondAttempt).toBe(false);
  });
});
