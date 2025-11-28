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

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type AddJobMembersInput = z.infer<typeof addJobMembersSchema>;
