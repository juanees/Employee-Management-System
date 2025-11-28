import { FastifyPluginAsync } from 'fastify';
import { createRoleSchema, updateRoleSchema, assignRoleSchema } from './role.schema';
import { roleService } from './role.service';
import { employeeService } from '../employees/employee.service';

const roleRoutes: FastifyPluginAsync = async (app) => {
  app.post('/', async (request, reply) => {
    const body = createRoleSchema.parse(request.body);
    const role = await roleService.create(body);
    reply.code(201).send(role);
  });

  app.get('/', async () => roleService.list());

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const role = await roleService.findById(id);
    if (!role) return reply.code(404).send({ message: 'Role not found' });
    return role;
  });

  app.patch('/:id', async (request, reply) => {
    const body = updateRoleSchema.parse(request.body ?? {});
    const { id } = request.params as { id: string };
    const updated = await roleService.update(id, body);
    if (!updated) return reply.code(404).send({ message: 'Role not found' });
    return updated;
  });

  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const deleted = await roleService.delete(id);
    if (!deleted) return reply.code(404).send({ message: 'Role not found' });
    return reply.code(204).send();
  });

  app.post('/:id/assign', async (request, reply) => {
    const { id } = request.params as { id: string };
    const role = await roleService.findById(id);
    if (!role) return reply.code(404).send({ message: 'Role not found' });

    const body = assignRoleSchema.parse(request.body ?? {});
    const employee = await employeeService.assignRole(body.employeeId, role.id);
    if (!employee) return reply.code(404).send({ message: 'Employee not found' });

    return { employee, role };
  });
};

export default roleRoutes;
