import { apiClient } from '@/lib/api';

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions?: string[];
}

export type UpdateRoleRequest = Partial<CreateRoleRequest>;

export async function listRoles() {
  return apiClient.get<Role[]>('/roles');
}

export async function createRole(payload: CreateRoleRequest) {
  return apiClient.post<Role>('/roles', payload);
}

export async function updateRole(id: string, payload: UpdateRoleRequest) {
  return apiClient.patch<Role>(`/roles/${id}`, payload);
}

export async function deleteRole(id: string) {
  return apiClient.delete<void>(`/roles/${id}`);
}
