import { Vehicle as VehicleModel } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { Vehicle } from './vehicle.types';
import { CreateVehicleInput, UpdateVehicleInput } from './vehicle.schema';

class VehicleService {
  constructor(private readonly client = prisma) {}

  private toDomain(record: VehicleModel): Vehicle {
    return {
      id: record.id,
      plateNumber: record.plateNumber,
      model: record.model,
      year: record.year,
      insuranceExpiresOn: record.insuranceExpiresOn.toISOString(),
      vtvExpiresOn: record.vtvExpiresOn.toISOString(),
      status: record.status as Vehicle['status'],
      assignedEmployeeId: record.assignedEmployeeId ?? undefined,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    };
  }

  async create(payload: CreateVehicleInput): Promise<Vehicle> {
    const record = await this.client.vehicle.create({
      data: {
        plateNumber: payload.plateNumber,
        model: payload.model,
        year: payload.year,
        insuranceExpiresOn: new Date(payload.insuranceExpiresOn),
        vtvExpiresOn: new Date(payload.vtvExpiresOn),
        status: payload.status ?? 'available'
      }
    });

    return this.toDomain(record);
  }

  async list(): Promise<Vehicle[]> {
    const vehicles = await this.client.vehicle.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return vehicles.map((vehicle) => this.toDomain(vehicle));
  }

  async findById(id: string): Promise<Vehicle | null> {
    const vehicle = await this.client.vehicle.findUnique({ where: { id } });
    return vehicle ? this.toDomain(vehicle) : null;
  }

  async update(id: string, payload: UpdateVehicleInput): Promise<Vehicle | null> {
    const vehicle = await this.client.vehicle.findUnique({ where: { id } });
    if (!vehicle) return null;

    const record = await this.client.vehicle.update({
      where: { id },
      data: {
        ...('plateNumber' in payload ? { plateNumber: payload.plateNumber } : {}),
        ...('model' in payload ? { model: payload.model } : {}),
        ...('year' in payload ? { year: payload.year } : {}),
        ...('insuranceExpiresOn' in payload && payload.insuranceExpiresOn
          ? { insuranceExpiresOn: new Date(payload.insuranceExpiresOn) }
          : {}),
        ...('vtvExpiresOn' in payload && payload.vtvExpiresOn
          ? { vtvExpiresOn: new Date(payload.vtvExpiresOn) }
          : {}),
        ...('status' in payload ? { status: payload.status } : {}),
        ...('assignedEmployeeId' in payload
          ? { assignedEmployeeId: payload.assignedEmployeeId ?? null }
          : {})
      }
    });

    return this.toDomain(record);
  }

  async assignEmployee(vehicleId: string, employeeId: string | null): Promise<Vehicle | null> {
    const vehicle = await this.client.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) return null;

    const record = await this.client.vehicle.update({
      where: { id: vehicleId },
      data: {
        assignedEmployeeId: employeeId,
        status: employeeId ? 'assigned' : 'available'
      }
    });

    return this.toDomain(record);
  }

  async clear() {
    await this.client.vehicle.deleteMany();
  }
}

export const vehicleService = new VehicleService();
