export type TravelStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'completed';

export interface TravelRequest {
  id: string;
  employeeId: string;
  vehicleId?: string;
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
