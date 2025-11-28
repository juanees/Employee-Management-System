import { z } from 'zod';

export const createVehicleSchema = z.object({
  plateNumber: z.string().min(5),
  model: z.string().min(1),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1),
  insuranceExpiresOn: z.string().datetime(),
  vtvExpiresOn: z.string().datetime(),
  status: z.enum(['available', 'assigned', 'maintenance', 'retired']).default('available')
});

export const updateVehicleSchema = createVehicleSchema.partial().extend({
  assignedEmployeeId: z.string().optional()
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
