import { z } from 'zod';

export const createTravelSchema = z.object({
  employeeId: z.string().uuid(),
  vehicleId: z.string().uuid().optional(),
  origin: z.string().min(2),
  destination: z.string().min(2),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  purpose: z.string().min(3)
});

export const updateTravelStatusSchema = z.object({
  status: z.enum(['draft', 'pending_approval', 'approved', 'rejected', 'completed']),
  approverComments: z.string().optional()
});

export const updateTravelSchema = createTravelSchema
  .partial()
  .extend({
    vehicleId: z.string().uuid().nullable().optional(),
    status: updateTravelStatusSchema.shape.status.optional(),
    approverComments: updateTravelStatusSchema.shape.approverComments
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'At least one field must be provided'
  });

export type CreateTravelInput = z.infer<typeof createTravelSchema>;
export type UpdateTravelStatusInput = z.infer<typeof updateTravelStatusSchema>;
export type UpdateTravelInput = z.infer<typeof updateTravelSchema>;
