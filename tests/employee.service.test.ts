import { describe, expect, it } from 'vitest';
import { EmployeeService } from '../src/modules/employees/employee.service';

const samplePayload = {
  dni: '12345678',
  firstName: 'Alice',
  lastName: 'Doe',
  email: 'alice@example.com',
  taxStatus: 'registered' as const,
  status: 'active' as const,
  hiredAt: new Date().toISOString()
};

describe('EmployeeService', () => {
  it('creates employees with defaults', () => {
    const service = new EmployeeService();
    const employee = service.create(samplePayload);

    expect(employee.id).toBeDefined();
    expect(employee.roles).toEqual([]);
    expect(employee.taxStatus).toBe('registered');
  });

  it('assigns roles without duplication', () => {
    const service = new EmployeeService();
    const employee = service.create(samplePayload);

    const updated = service.assignRole(employee.id, 'role-1');
    expect(updated?.roles).toEqual(['role-1']);

    const duplicate = service.assignRole(employee.id, 'role-1');
    expect(duplicate?.roles).toEqual(['role-1']);
  });
});
