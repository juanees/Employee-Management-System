import { randomUUID } from 'node:crypto';
import { Vehicle } from './vehicle.types';
import { CreateVehicleInput, UpdateVehicleInput } from './vehicle.schema';

class VehicleService {
  private vehicles = new Map<string, Vehicle>();

  create(payload: CreateVehicleInput): Vehicle {
    const now = new Date().toISOString();
    const vehicle: Vehicle = {
      id: randomUUID(),
      plateNumber: payload.plateNumber,
      model: payload.model,
      year: payload.year,
      insuranceExpiresOn: payload.insuranceExpiresOn,
      vtvExpiresOn: payload.vtvExpiresOn,
      status: payload.status ?? 'available',
      createdAt: now,
      updatedAt: now
    };

    this.vehicles.set(vehicle.id, vehicle);
    return vehicle;
  }

  list(): Vehicle[] {
    return Array.from(this.vehicles.values());
  }

  findById(id: string): Vehicle | null {
    return this.vehicles.get(id) ?? null;
  }

  update(id: string, payload: UpdateVehicleInput): Vehicle | null {
    const existing = this.vehicles.get(id);
    if (!existing) return null;

    const updated: Vehicle = {
      ...existing,
      ...payload,
      updatedAt: new Date().toISOString()
    };

    this.vehicles.set(id, updated);
    return updated;
  }

  assignEmployee(vehicleId: string, employeeId: string | null): Vehicle | null {
    const existing = this.vehicles.get(vehicleId);
    if (!existing) return null;

    existing.assignedEmployeeId = employeeId ?? undefined;
    existing.status = employeeId ? 'assigned' : 'available';
    existing.updatedAt = new Date().toISOString();
    return existing;
  }
}

export const vehicleService = new VehicleService();
