export type VehicleStatus = 'available' | 'assigned' | 'maintenance' | 'retired';

export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  year: number;
  insuranceExpiresOn: string;
  vtvExpiresOn: string;
  status: VehicleStatus;
  assignedEmployeeId?: string;
  createdAt: string;
  updatedAt: string;
}
