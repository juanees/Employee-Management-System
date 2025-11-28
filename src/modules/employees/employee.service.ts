import { Employee as EmployeeModel } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { Employee } from './employee.types';
import { CreateEmployeeInput, UpdateEmployeeInput } from './employee.schema';
import {
  DeleteConflictError,
  isForeignKeyConstraintError,
  isRecordNotFoundError
} from '../shared/errors';

const unique = (items: string[]) => Array.from(new Set(items));

export class EmployeeService {
  constructor(private readonly client = prisma) {}

  private toDomain(record: EmployeeModel): Employee {
    return {
      id: record.id,
      dni: record.dni,
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      taxStatus: (record.taxStatus as Employee['taxStatus']) ?? 'unknown',
      status: (record.status as Employee['status']) ?? 'active',
      roles: JSON.parse(record.roles) as string[],
      hiredAt: record.hiredAt.toISOString(),
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    };
  }

  async create(payload: CreateEmployeeInput): Promise<Employee> {
    const record = await this.client.employee.create({
      data: {
        dni: payload.dni,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        taxStatus: payload.taxStatus ?? 'unknown',
        status: payload.status ?? 'active',
        roles: JSON.stringify([]),
        hiredAt: payload.hiredAt ? new Date(payload.hiredAt) : new Date()
      }
    });

    return this.toDomain(record);
  }

  async list(): Promise<Employee[]> {
    const employees = await this.client.employee.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return employees.map((employee) => this.toDomain(employee));
  }

  async findById(id: string): Promise<Employee | null> {
    const employee = await this.client.employee.findUnique({ where: { id } });
    return employee ? this.toDomain(employee) : null;
  }

  async update(id: string, payload: UpdateEmployeeInput): Promise<Employee | null> {
    const employee = await this.client.employee.findUnique({ where: { id } });
    if (!employee) return null;

    const updated = await this.client.employee.update({
      where: { id },
      data: {
        ...('dni' in payload ? { dni: payload.dni } : {}),
        ...('firstName' in payload ? { firstName: payload.firstName } : {}),
        ...('lastName' in payload ? { lastName: payload.lastName } : {}),
        ...('email' in payload ? { email: payload.email } : {}),
        ...('taxStatus' in payload ? { taxStatus: payload.taxStatus } : {}),
        ...('status' in payload ? { status: payload.status } : {}),
        ...('hiredAt' in payload && payload.hiredAt ? { hiredAt: new Date(payload.hiredAt) } : {}),
        ...('roles' in payload ? { roles: JSON.stringify(unique(payload.roles ?? [])) } : {})
      }
    });

    return this.toDomain(updated);
  }

  async assignRole(employeeId: string, roleId: string): Promise<Employee | null> {
    const employee = await this.client.employee.findUnique({ where: { id: employeeId } });
    if (!employee) return null;

    const roles = unique([...((JSON.parse(employee.roles) as string[]) ?? []), roleId]);
    const updated = await this.client.employee.update({
      where: { id: employeeId },
      data: { roles: JSON.stringify(roles) }
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.client.employee.delete({ where: { id } });
      return true;
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        return false;
      }

      if (isForeignKeyConstraintError(error)) {
        throw new DeleteConflictError('Employee is referenced by other records');
      }

      throw error;
    }
  }

  async clear() {
    await this.client.employee.deleteMany();
  }
}

export const employeeService = new EmployeeService();
