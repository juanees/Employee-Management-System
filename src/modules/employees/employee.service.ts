import { randomUUID } from 'node:crypto';
import { Employee } from './employee.types';
import { CreateEmployeeInput, UpdateEmployeeInput } from './employee.schema';

export class EmployeeService {
  private employees = new Map<string, Employee>();

  create(payload: CreateEmployeeInput): Employee {
    const now = new Date().toISOString();
    const employee: Employee = {
      id: randomUUID(),
      dni: payload.dni,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      taxStatus: payload.taxStatus ?? 'unknown',
      status: payload.status ?? 'active',
      roles: [],
      hiredAt: payload.hiredAt ?? now,
      createdAt: now,
      updatedAt: now
    };

    this.employees.set(employee.id, employee);
    return employee;
  }

  list(): Employee[] {
    return Array.from(this.employees.values());
  }

  findById(id: string): Employee | null {
    return this.employees.get(id) ?? null;
  }

  update(id: string, payload: UpdateEmployeeInput): Employee | null {
    const existing = this.employees.get(id);
    if (!existing) return null;

    const updated: Employee = {
      ...existing,
      ...payload,
      roles: payload.roles ? Array.from(new Set(payload.roles)) : existing.roles,
      updatedAt: new Date().toISOString()
    };

    this.employees.set(id, updated);
    return updated;
  }

  assignRole(employeeId: string, roleId: string): Employee | null {
    const existing = this.employees.get(employeeId);
    if (!existing) return null;

    if (!existing.roles.includes(roleId)) {
      existing.roles.push(roleId);
      existing.updatedAt = new Date().toISOString();
    }

    return existing;
  }
  clear() {
    this.employees.clear();
  }
}

export const employeeService = new EmployeeService();
