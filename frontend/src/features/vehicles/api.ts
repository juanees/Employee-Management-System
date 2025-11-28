import { apiClient } from '@/lib/api';

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

export interface CreateVehicleRequest {
  plateNumber: string;
  model: string;
  year: number;
  insuranceExpiresOn: string;
  vtvExpiresOn: string;
  status?: VehicleStatus;
}

export type UpdateVehicleRequest = Partial<
  CreateVehicleRequest & {
    assignedEmployeeId?: string | null;
  }
>;

export async function listVehicles() {
  return apiClient.get<Vehicle[]>('/vehicles');
}

export async function createVehicle(payload: CreateVehicleRequest) {
  return apiClient.post<Vehicle>('/vehicles', payload);
}

export async function updateVehicle(id: string, payload: UpdateVehicleRequest) {
  return apiClient.patch<Vehicle>(`/vehicles/${id}`, payload);
}

export async function deleteVehicle(id: string) {
  return apiClient.delete<void>(`/vehicles/${id}`);
}
