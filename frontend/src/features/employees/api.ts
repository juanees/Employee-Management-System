import { apiClient } from '@/lib/api';

export type EmployeeStatus = 'active' | 'inactive' | 'terminated';
export type TaxStatus = 'registered' | 'withholding' | 'exempt' | 'unknown';

export interface Employee {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  email: string;
  taxStatus: TaxStatus;
  status: EmployeeStatus;
  roles: string[];
  hiredAt: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface CreateEmployeeRequest {
  dni: string;
  firstName: string;
  lastName: string;
  email: string;
  taxStatus?: TaxStatus;
  status?: EmployeeStatus;
  hiredAt?: string;
}

export type UpdateEmployeeRequest = Partial<
  Pick<Employee, 'dni' | 'firstName' | 'lastName' | 'email' | 'taxStatus' | 'status' | 'hiredAt' | 'roles'>
>;

export async function listEmployees() {
  return apiClient.get<Employee[]>('/employees');
}

export async function downloadEmployeeImportTemplate() {
  return apiClient.download('/employees/import/template');
}

export async function importEmployeesFromCsv(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.postForm<EmployeeImportResult>('/employees/import', formData);
}

export async function createEmployee(payload: CreateEmployeeRequest) {
  return apiClient.post<Employee>('/employees', payload);
}

export async function updateEmployee(id: string, payload: UpdateEmployeeRequest) {
  return apiClient.patch<Employee>(`/employees/${id}`, payload);
}

export async function deleteEmployee(id: string) {
  return apiClient.delete<void>(`/employees/${id}`);
}
