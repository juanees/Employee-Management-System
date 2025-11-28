import { describe, expect, it } from 'vitest';
import { roleService } from '../src/modules/roles/role.service';

describe('RoleService', () => {
  it('creates roles with default permissions', async () => {
    const role = await roleService.create({
      name: 'ops-admin',
      description: 'Oversees operations',
      permissions: ['ops:read']
    });

    expect(role.id).toBeDefined();
    expect(role.permissions).toEqual(['ops:read']);

    const list = await roleService.list();
    expect(list.length).toBeGreaterThanOrEqual(1);
  });

  it('updates and deletes roles', async () => {
    const role = await roleService.create({
      name: 'temp-role'
    });

    const updated = await roleService.update(role.id, {
      description: 'Updated'
    });

    expect(updated?.description).toBe('Updated');

    const deleted = await roleService.delete(role.id);
    expect(deleted).toBe(true);
    const secondAttempt = await roleService.delete(role.id);
    expect(secondAttempt).toBe(false);
  });
});
