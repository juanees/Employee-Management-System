import { randomUUID } from 'node:crypto';
import { TravelRequest } from './travel.types';
import { CreateTravelInput, UpdateTravelStatusInput } from './travel.schema';

export class TravelService {
  private requests = new Map<string, TravelRequest>();

  create(payload: CreateTravelInput): TravelRequest {
    const start = new Date(payload.startDate);
    const end = new Date(payload.endDate);

    if (end < start) {
      throw new Error('End date must be after start date');
    }

    const now = new Date().toISOString();
    const request: TravelRequest = {
      id: randomUUID(),
      employeeId: payload.employeeId,
      vehicleId: payload.vehicleId,
      origin: payload.origin,
      destination: payload.destination,
      startDate: payload.startDate,
      endDate: payload.endDate,
      purpose: payload.purpose,
      status: 'pending_approval',
      createdAt: now,
      updatedAt: now
    };

    this.requests.set(request.id, request);
    return request;
  }

  list(): TravelRequest[] {
    return Array.from(this.requests.values());
  }

  findById(id: string): TravelRequest | null {
    return this.requests.get(id) ?? null;
  }

  updateStatus(id: string, payload: UpdateTravelStatusInput): TravelRequest | null {
    const existing = this.requests.get(id);
    if (!existing) return null;

    const updated: TravelRequest = {
      ...existing,
      status: payload.status,
      approverComments: payload.approverComments,
      updatedAt: new Date().toISOString()
    };

    this.requests.set(id, updated);
    return updated;
  }
}

export const travelService = new TravelService();
