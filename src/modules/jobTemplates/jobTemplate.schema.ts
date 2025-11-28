import { z } from 'zod';

export const createJobTemplateSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  defaultRoles: z.array(z.string().min(1)).optional()
});

export const updateJobTemplateSchema = createJobTemplateSchema
  .partial()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'At least one field must be provided'
  });

export const instantiateJobTemplateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  leaderId: z.string().uuid(),
  memberAssignments: z
    .array(
      z.object({
        employeeId: z.string().uuid(),
        role: z.string().min(1).optional()
      })
    )
    .optional()
});

export type CreateJobTemplateInput = z.infer<typeof createJobTemplateSchema>;
export type InstantiateJobTemplateInput = z.infer<typeof instantiateJobTemplateSchema>;
export type UpdateJobTemplateInput = z.infer<typeof updateJobTemplateSchema>;
