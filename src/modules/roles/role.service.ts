import { randomUUID } from 'node:crypto';
import { Role } from './role.types';
import { CreateRoleInput, UpdateRoleInput } from './role.schema';

class RoleService {
  private roles = new Map<string, Role>();

  create(payload: CreateRoleInput): Role {
    const now = new Date().toISOString();
    const role: Role = {
      id: randomUUID(),
      name: payload.name,
      description: payload.description,
      permissions: payload.permissions ?? [],
      createdAt: now,
      updatedAt: now
    };

    this.roles.set(role.id, role);
    return role;
  }

  list(): Role[] {
    return Array.from(this.roles.values());
  }

  findById(id: string): Role | null {
    return this.roles.get(id) ?? null;
  }

  update(id: string, payload: UpdateRoleInput): Role | null {
    const existing = this.roles.get(id);
    if (!existing) return null;

    const updated: Role = {
      ...existing,
      ...payload,
      permissions: payload.permissions ?? existing.permissions,
      updatedAt: new Date().toISOString()
    };

    this.roles.set(id, updated);
    return updated;
  }
}

export const roleService = new RoleService();
