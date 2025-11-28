import { Role as RoleModel } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { Role } from './role.types';
import { CreateRoleInput, UpdateRoleInput } from './role.schema';
import { isRecordNotFoundError } from '../shared/errors';

class RoleService {
  constructor(private readonly client = prisma) {}

  private toDomain(record: RoleModel): Role {
    return {
      id: record.id,
      name: record.name,
      description: record.description ?? undefined,
      permissions: JSON.parse(record.permissions) as string[],
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    };
  }

  async create(payload: CreateRoleInput): Promise<Role> {
    const record = await this.client.role.create({
      data: {
        name: payload.name,
        description: payload.description,
        permissions: JSON.stringify(payload.permissions ?? [])
      }
    });

    return this.toDomain(record);
  }

  async list(): Promise<Role[]> {
    const roles = await this.client.role.findMany({ orderBy: { createdAt: 'desc' } });
    return roles.map((role) => this.toDomain(role));
  }

  async findById(id: string): Promise<Role | null> {
    const role = await this.client.role.findUnique({ where: { id } });
    return role ? this.toDomain(role) : null;
  }

  async update(id: string, payload: UpdateRoleInput): Promise<Role | null> {
    const role = await this.client.role.findUnique({ where: { id } });
    if (!role) return null;

    const record = await this.client.role.update({
      where: { id },
      data: {
        ...('name' in payload ? { name: payload.name } : {}),
        ...('description' in payload ? { description: payload.description } : {}),
        ...('permissions' in payload
          ? { permissions: JSON.stringify(payload.permissions ?? []) }
          : {})
      }
    });

    return this.toDomain(record);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.client.role.delete({ where: { id } });
      return true;
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        return false;
      }

      throw error;
    }
  }

  async clear() {
    await this.client.role.deleteMany();
  }
}

export const roleService = new RoleService();
