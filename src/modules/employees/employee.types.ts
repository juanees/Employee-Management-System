export type TaxStatus = 'registered' | 'withholding' | 'exempt' | 'unknown';
export type EmployeeStatus = 'active' | 'inactive' | 'terminated';

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
