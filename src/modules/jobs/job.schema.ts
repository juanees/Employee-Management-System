import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  leaderId: z.string().uuid(),
  memberIds: z.array(z.string().uuid()).optional()
});

export const addJobMembersSchema = z.object({
  employeeIds: z.array(z.string().uuid()).nonempty()
});

export const updateJobSchema = z
  .object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    templateId: z.string().uuid().nullable().optional()
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'At least one field must be provided'
  });

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type AddJobMembersInput = z.infer<typeof addJobMembersSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
