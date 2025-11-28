import { describe, expect, it } from 'vitest';
import {
  EmployeeService,
  InvalidEmployeeImportFileError
} from '../src/modules/employees/employee.service';
import { prisma } from '../src/lib/prisma';

const service = new EmployeeService();

const buildCsv = (rows: string[]) =>
  ['dni,firstName,lastName,email,taxStatus,status,hiredAt', ...rows].join('\n');

describe('EmployeeService.importFromCsv', () => {
  it('imports valid rows and reports a clean summary', async () => {
    const csv = buildCsv([
      '12345678,Ana,Lopez,ana.lopez@example.com,registered,active,2024-01-01',
      '87654321,Bob,Stone,bob.stone@example.com,withholding,inactive,2024-02-15'
    ]);

    const result = await service.importFromCsv(Buffer.from(csv, 'utf-8'));

    expect(result.totalRows).toBe(2);
    expect(result.createdCount).toBe(2);
    expect(result.failedCount).toBe(0);
    expect(result.errors).toHaveLength(0);

    const employees = await prisma.employee.findMany();
    expect(employees).toHaveLength(2);
  });

  it('returns row-level errors for invalid data and duplicates', async () => {
    const csv = buildCsv([
      ',NoEmail,,invalid-email,registered,active,not-a-date',
      '12345678,Alice,Doe,alice@example.com,registered,active,2024-02-01',
      '12345678,Bob,Doe,bob@example.com,registered,active,2024-02-02'
    ]);

    const result = await service.importFromCsv(Buffer.from(csv, 'utf-8'));

    expect(result.totalRows).toBe(3);
    expect(result.createdCount).toBe(1);
    expect(result.failedCount).toBe(2);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
    const duplicateError = result.errors.find(
      (error) => error.field === 'dni' && error.rowNumber === 4
    );
    expect(duplicateError?.message).toContain('duplicated');
  });

  it('rejects CSV files missing required headers', async () => {
    const csv = 'foo,bar\n1,2';
    await expect(service.importFromCsv(Buffer.from(csv, 'utf-8'))).rejects.toBeInstanceOf(
      InvalidEmployeeImportFileError
    );
  });

  it('flags conflicts with existing employees', async () => {
    await service.create({
      dni: '99999999',
      firstName: 'Existing',
      lastName: 'Person',
      email: 'existing@example.com',
      taxStatus: 'registered',
      status: 'active',
      hiredAt: new Date().toISOString()
    });

    const csv = buildCsv([
      '99999999,New,Person,new.person@example.com,registered,active,2024-02-01',
      '12345678,Another,User,existing@example.com,registered,active,2024-02-02'
    ]);

    const result = await service.importFromCsv(Buffer.from(csv, 'utf-8'));

    expect(result.totalRows).toBe(2);
    expect(result.createdCount).toBe(0);
    expect(result.failedCount).toBe(2);
    expect(result.errors.filter((error) => error.message.includes('already exists.'))).toHaveLength(2);
  });
});
