import { apiClient } from '@/lib/api';

export interface JobAssignment {
  id: string;
  jobId: string;
  employeeId: string;
  role: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  title: string;
  description?: string;
  leaderId: string;
  leader: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  template?: {
    id: string;
    title: string;
  };
  assignments: JobAssignment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobRequest {
  title: string;
  leaderId: string;
  description?: string;
  memberIds?: string[];
}

export type UpdateJobRequest = Partial<{
  title: string;
  description?: string;
  templateId?: string | null;
}>;

export interface AddJobMembersRequest {
  employeeIds: string[];
}

export async function listJobs() {
  return apiClient.get<Job[]>('/jobs');
}

export async function createJob(payload: CreateJobRequest) {
  return apiClient.post<Job>('/jobs', payload);
}

export async function updateJob(id: string, payload: UpdateJobRequest) {
  return apiClient.patch<Job>(`/jobs/${id}`, payload);
}

export async function deleteJob(id: string) {
  return apiClient.delete<void>(`/jobs/${id}`);
}

export async function addJobMembers(id: string, payload: AddJobMembersRequest) {
  return apiClient.post<Job>(`/jobs/${id}/members`, payload);
}
