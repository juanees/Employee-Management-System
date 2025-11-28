import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { EmployeeService } from '../src/modules/employees/employee.service';

const service = new EmployeeService();

const buildPayload = () => ({
  dni: `${Math.floor(Math.random() * 1_000_000_000)}`,
  firstName: 'Alice',
  lastName: 'Doe',
  email: `alice+${randomUUID()}@example.com`,
  taxStatus: 'registered' as const,
  status: 'active' as const,
  hiredAt: new Date().toISOString()
});

describe('EmployeeService', () => {
  it('creates employees with defaults', async () => {
    const employee = await service.create(buildPayload());

    expect(employee.id).toBeDefined();
    expect(employee.roles).toEqual([]);
    expect(employee.taxStatus).toBe('registered');
  });

  it('assigns roles without duplication', async () => {
    const employee = await service.create(buildPayload());

    const updated = await service.assignRole(employee.id, 'role-1');
    expect(updated?.roles).toEqual(['role-1']);

    const duplicate = await service.assignRole(employee.id, 'role-1');
    expect(duplicate?.roles).toEqual(['role-1']);
  });
});
