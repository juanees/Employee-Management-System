import { apiClient } from '@/lib/api';
import type { Job } from '@/features/jobs/api';

export interface JobTemplate {
  id: string;
  title: string;
  description?: string;
  defaultRoles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobTemplateRequest {
  title: string;
  description?: string;
  defaultRoles?: string[];
}

export type UpdateJobTemplateRequest = Partial<CreateJobTemplateRequest>;

export interface InstantiateJobTemplateRequest {
  title?: string;
  description?: string;
  leaderId: string;
  memberAssignments?: Array<{
    employeeId: string;
    role?: string;
  }>;
}

export async function listJobTemplates() {
  return apiClient.get<JobTemplate[]>('/job-templates');
}

export async function createJobTemplate(payload: CreateJobTemplateRequest) {
  return apiClient.post<JobTemplate>('/job-templates', payload);
}

export async function updateJobTemplate(id: string, payload: UpdateJobTemplateRequest) {
  return apiClient.patch<JobTemplate>(`/job-templates/${id}`, payload);
}

export async function deleteJobTemplate(id: string) {
  return apiClient.delete<void>(`/job-templates/${id}`);
}

export async function instantiateJobTemplate(id: string, payload: InstantiateJobTemplateRequest) {
  return apiClient.post<Job>(`/job-templates/${id}/instantiate`, payload);
}
