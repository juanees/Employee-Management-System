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

export async function listEmployees() {
  return apiClient.get<Employee[]>('/employees');
}
