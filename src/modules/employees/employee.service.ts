import { Employee as EmployeeModel } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import { prisma } from '../../lib/prisma';
import { Employee } from './employee.types';
import { createEmployeeSchema, CreateEmployeeInput, UpdateEmployeeInput } from './employee.schema';

const unique = (items: string[]) => Array.from(new Set(items));
const cleanValue = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

export const EMPLOYEE_IMPORT_HEADERS = [
  'dni',
  'firstName',
  'lastName',
  'email',
  'taxStatus',
  'status',
  'hiredAt'
] as const;

const EMPLOYEE_IMPORT_TEMPLATE = [
  EMPLOYEE_IMPORT_HEADERS.join(','),
  '20456789,Sofia,Perez,sofia.perez@example.com,registered,active,2024-03-01'
].join('\n');

export interface EmployeeImportError {
  rowNumber: number;
  field: string;
  message: string;
}

export interface EmployeeImportResult {
  totalRows: number;
  createdCount: number;
  failedCount: number;
  errors: EmployeeImportError[];
}

export class InvalidEmployeeImportFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidEmployeeImportFileError';
  }
}

type ReportErrorFn = (rowNumber: number, field: string, message: string) => void;
type CsvRow = Record<string, string>;

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

  async clear() {
    await this.client.employee.deleteMany();
  }

  getImportTemplate(): string {
    return `${EMPLOYEE_IMPORT_TEMPLATE}\n`;
  }

  async importFromCsv(fileBuffer: Buffer): Promise<EmployeeImportResult> {
    const csvContent = fileBuffer.toString('utf-8').trim();
    if (!csvContent) {
      throw new InvalidEmployeeImportFileError('CSV file is empty. Download the template and add at least one employee row.');
    }

    const [rawHeaderLine] = csvContent.split(/\r?\n/);
    if (!rawHeaderLine) {
      throw new InvalidEmployeeImportFileError('CSV file is missing the header row.');
    }

    const headerColumns = rawHeaderLine
      .split(',')
      .map((column) => column.trim().replace(/^"|"$/g, ''));
    const missingColumns = EMPLOYEE_IMPORT_HEADERS.filter((column) => !headerColumns.includes(column));
    if (missingColumns.length > 0) {
      throw new InvalidEmployeeImportFileError(
        `CSV is missing required columns: ${missingColumns.join(', ')}. Download a fresh template to continue.`
      );
    }

    let rows: CsvRow[];
    try {
      rows = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      }) as CsvRow[];
    } catch (error) {
      throw new InvalidEmployeeImportFileError('Unable to parse CSV file. Ensure it is a valid comma-separated file.');
    }

    if (rows.length === 0) {
      throw new InvalidEmployeeImportFileError('CSV file does not contain any employee rows.');
    }

    const errors: EmployeeImportError[] = [];
    const failedRows = new Set<number>();
    const validRows: { rowNumber: number; payload: CreateEmployeeInput }[] = [];

    const reportError: ReportErrorFn = (rowNumber, field, message) => {
      errors.push({ rowNumber, field, message });
      failedRows.add(rowNumber);
    };

    rows.forEach((rawRow, index) => {
      const rowNumber = index + 2; // account for header row
      const normalized = this.normalizeCsvRow(rawRow, rowNumber, reportError);
      const validation = createEmployeeSchema.safeParse(normalized);
      if (!validation.success) {
        validation.error.issues.forEach((issue) => {
          const field = typeof issue.path[0] === 'string' ? issue.path[0] : 'row';
          reportError(rowNumber, field, issue.message);
        });
        return;
      }

      validRows.push({ rowNumber, payload: validation.data });
    });

    this.ensureNoDuplicates(validRows, 'dni', reportError);
    this.ensureNoDuplicates(validRows, 'email', reportError);

    const candidateRows = validRows.filter((row) => !failedRows.has(row.rowNumber));
    if (candidateRows.length > 0) {
      const existingConflicts = await this.findExistingConflicts(candidateRows);
      candidateRows.forEach((row) => {
        if (existingConflicts.dni.has(row.payload.dni)) {
          reportError(row.rowNumber, 'dni', `DNI ${row.payload.dni} already exists.`);
        }
        if (existingConflicts.email.has(row.payload.email)) {
          reportError(row.rowNumber, 'email', `Email ${row.payload.email} already exists.`);
        }
      });
    }

    const insertableRows = validRows.filter((row) => !failedRows.has(row.rowNumber));
    let insertedCount = 0;
    if (insertableRows.length > 0) {
      const { count } = await this.client.employee.createMany({
        data: insertableRows.map((row) => ({
          dni: row.payload.dni,
          firstName: row.payload.firstName,
          lastName: row.payload.lastName,
          email: row.payload.email,
          taxStatus: row.payload.taxStatus ?? 'unknown',
          status: row.payload.status ?? 'active',
          roles: JSON.stringify([]),
          hiredAt: row.payload.hiredAt ? new Date(row.payload.hiredAt) : new Date()
        }))
      });
      insertedCount = count;
    }

    const totalRows = rows.length;

    return {
      totalRows,
      createdCount: insertedCount,
      failedCount: totalRows - insertedCount,
      errors: errors.sort((a, b) =>
        a.rowNumber === b.rowNumber ? a.field.localeCompare(b.field) : a.rowNumber - b.rowNumber
      )
    };
  }

  private normalizeCsvRow(rawRow: CsvRow, rowNumber: number, reportError: ReportErrorFn): Partial<CreateEmployeeInput> {
    const normalized: Partial<CreateEmployeeInput> = {
      dni: cleanValue(rawRow.dni),
      firstName: cleanValue(rawRow.firstName),
      lastName: cleanValue(rawRow.lastName),
      email: cleanValue(rawRow.email)
    };

    const taxStatus = cleanValue(rawRow.taxStatus);
    if (taxStatus) {
      normalized.taxStatus = taxStatus.toLowerCase() as CreateEmployeeInput['taxStatus'];
    }

    const status = cleanValue(rawRow.status);
    if (status) {
      normalized.status = status.toLowerCase() as CreateEmployeeInput['status'];
    }

    const hiredAt = cleanValue(rawRow.hiredAt);
    if (hiredAt) {
      const parsedDate = new Date(hiredAt);
      if (Number.isNaN(parsedDate.getTime())) {
        reportError(rowNumber, 'hiredAt', 'Invalid date. Use YYYY-MM-DD or a valid ISO date string.');
      } else {
        normalized.hiredAt = parsedDate.toISOString();
      }
    }

    return normalized;
  }

  private ensureNoDuplicates(
    rows: { rowNumber: number; payload: CreateEmployeeInput }[],
    key: 'dni' | 'email',
    reportError: ReportErrorFn
  ) {
    const occurrences = new Map<string, number[]>();
    rows.forEach((row) => {
      const value = row.payload[key];
      const current = occurrences.get(value) ?? [];
      current.push(row.rowNumber);
      occurrences.set(value, current);
    });

    occurrences.forEach((rowNumbers, value) => {
      if (rowNumbers.length <= 1) return;
      const [, ...duplicates] = [...rowNumbers].sort((a, b) => a - b);
      duplicates.forEach((rowNumber) => {
        reportError(rowNumber, key, `${key.toUpperCase()} "${value}" is duplicated in the file.`);
      });
    });
  }

  private async findExistingConflicts(rows: { rowNumber: number; payload: CreateEmployeeInput }[]) {
    const dnis = unique(rows.map((row) => row.payload.dni));
    const emails = unique(rows.map((row) => row.payload.email));

    if (dnis.length === 0 && emails.length === 0) {
      return {
        dni: new Set<string>(),
        email: new Set<string>()
      };
    }

    const existing = await this.client.employee.findMany({
      where: {
        OR: [
          ...(dnis.length > 0 ? [{ dni: { in: dnis } }] : []),
          ...(emails.length > 0 ? [{ email: { in: emails } }] : [])
        ]
      },
      select: { dni: true, email: true }
    });

    return {
      dni: new Set(existing.map((employee) => employee.dni)),
      email: new Set(existing.map((employee) => employee.email))
    };
  }
}

export const employeeService = new EmployeeService();
