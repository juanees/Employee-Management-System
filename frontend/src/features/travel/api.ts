import { apiClient } from '@/lib/api';

export type TravelStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'completed';

export interface TravelRequest {
  id: string;
  employeeId: string;
  vehicleId?: string | null;
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  purpose: string;
  status: TravelStatus;
  approverComments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTravelRequest {
  employeeId: string;
  vehicleId?: string;
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  purpose: string;
}

export type UpdateTravelRequest = Partial<
  CreateTravelRequest & {
    status?: TravelStatus;
    approverComments?: string;
  }
>;

export interface UpdateTravelStatusRequest {
  status: TravelStatus;
  approverComments?: string;
}

export async function listTravelRequests() {
  return apiClient.get<TravelRequest[]>('/travel');
}

export async function createTravelRequest(payload: CreateTravelRequest) {
  return apiClient.post<TravelRequest>('/travel', payload);
}

export async function updateTravelRequest(id: string, payload: UpdateTravelRequest) {
  return apiClient.patch<TravelRequest>(`/travel/${id}`, payload);
}

export async function updateTravelStatus(id: string, payload: UpdateTravelStatusRequest) {
  return apiClient.patch<TravelRequest>(`/travel/${id}/status`, payload);
}

export async function deleteTravelRequest(id: string) {
  return apiClient.delete<void>(`/travel/${id}`);
}
