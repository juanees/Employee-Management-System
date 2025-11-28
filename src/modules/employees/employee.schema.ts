import { z } from 'zod';

export const createEmployeeSchema = z.object({
  dni: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  taxStatus: z.enum(['registered', 'withholding', 'exempt', 'unknown']).default('unknown'),
  hiredAt: z.string().datetime().optional(),
  status: z.enum(['active', 'inactive', 'terminated']).default('active')
});

export const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  roles: z.array(z.string().min(1)).optional()
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
