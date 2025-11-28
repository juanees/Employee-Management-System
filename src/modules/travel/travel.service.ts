import { TravelRequest as TravelRequestModel } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { TravelRequest } from './travel.types';
import {
  CreateTravelInput,
  UpdateTravelInput,
  UpdateTravelStatusInput
} from './travel.schema';
import { isRecordNotFoundError } from '../shared/errors';

export class TravelService {
  constructor(private readonly client = prisma) {}

  private toDomain(record: TravelRequestModel): TravelRequest {
    return {
      id: record.id,
      employeeId: record.employeeId,
      vehicleId: record.vehicleId ?? undefined,
      origin: record.origin,
      destination: record.destination,
      startDate: record.startDate.toISOString(),
      endDate: record.endDate.toISOString(),
      purpose: record.purpose,
      status: record.status as TravelRequest['status'],
      approverComments: record.approverComments ?? undefined,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    };
  }

  async create(payload: CreateTravelInput): Promise<TravelRequest> {
    const start = new Date(payload.startDate);
    const end = new Date(payload.endDate);

    if (end < start) {
      throw new Error('End date must be after start date');
    }

    const record = await this.client.travelRequest.create({
      data: {
        employeeId: payload.employeeId,
        vehicleId: payload.vehicleId,
        origin: payload.origin,
        destination: payload.destination,
        startDate: start,
        endDate: end,
        purpose: payload.purpose,
        status: 'pending_approval'
      }
    });

    return this.toDomain(record);
  }

  async list(): Promise<TravelRequest[]> {
    const requests = await this.client.travelRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return requests.map((request) => this.toDomain(request));
  }

  async findById(id: string): Promise<TravelRequest | null> {
    const travelRequest = await this.client.travelRequest.findUnique({ where: { id } });
    return travelRequest ? this.toDomain(travelRequest) : null;
  }

  async updateStatus(id: string, payload: UpdateTravelStatusInput): Promise<TravelRequest | null> {
    const request = await this.client.travelRequest.findUnique({ where: { id } });
    if (!request) return null;

    const record = await this.client.travelRequest.update({
      where: { id },
      data: {
        status: payload.status,
        approverComments: payload.approverComments
      }
    });

    return this.toDomain(record);
  }

  async updateDetails(id: string, payload: UpdateTravelInput): Promise<TravelRequest | null> {
    const request = await this.client.travelRequest.findUnique({ where: { id } });
    if (!request) return null;

    const start = payload.startDate ? new Date(payload.startDate) : request.startDate;
    const end = payload.endDate ? new Date(payload.endDate) : request.endDate;

    if (end < start) {
      throw new Error('End date must be after start date');
    }

    const record = await this.client.travelRequest.update({
      where: { id },
      data: {
        ...('employeeId' in payload ? { employeeId: payload.employeeId } : {}),
        ...('vehicleId' in payload ? { vehicleId: payload.vehicleId ?? null } : {}),
        ...('origin' in payload ? { origin: payload.origin } : {}),
        ...('destination' in payload ? { destination: payload.destination } : {}),
        ...('startDate' in payload ? { startDate: start } : {}),
        ...('endDate' in payload ? { endDate: end } : {}),
        ...('purpose' in payload ? { purpose: payload.purpose } : {}),
        ...('status' in payload ? { status: payload.status! } : {}),
        ...('approverComments' in payload ? { approverComments: payload.approverComments } : {})
      }
    });

    return this.toDomain(record);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.client.travelRequest.delete({ where: { id } });
      return true;
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        return false;
      }

      throw error;
    }
  }

  async clear() {
    await this.client.travelRequest.deleteMany();
  }
}

export const travelService = new TravelService();
