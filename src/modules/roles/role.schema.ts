import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  permissions: z.array(z.string().min(2)).default([])
});

export const updateRoleSchema = createRoleSchema.partial();

export const assignRoleSchema = z.object({
  employeeId: z.string().uuid()
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
