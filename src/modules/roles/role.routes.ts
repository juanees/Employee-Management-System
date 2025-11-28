import { FastifyPluginAsync } from 'fastify';
import { createRoleSchema, updateRoleSchema, assignRoleSchema } from './role.schema';
import { roleService } from './role.service';
import { employeeService } from '../employees/employee.service';

const roleRoutes: FastifyPluginAsync = async (app) => {
  app.post('/', async (request, reply) => {
    const result = createRoleSchema.safeParse(request.body);
    if (!result.success) {
      return reply.code(400).send({ message: 'Invalid input', issues: result.error.issues });
    }

    const role = await roleService.create(result.data);
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
    const result = updateRoleSchema.safeParse(request.body ?? {});
    if (!result.success) {
      return reply.code(400).send({ message: 'Invalid input', issues: result.error.issues });
    }

    const { id } = request.params as { id: string };
    const updated = await roleService.update(id, result.data);
    if (!updated) return reply.code(404).send({ message: 'Role not found' });
    return updated;
  });

  app.post('/:id/assign', async (request, reply) => {
    const { id } = request.params as { id: string };
    const role = await roleService.findById(id);
    if (!role) return reply.code(404).send({ message: 'Role not found' });

    const result = assignRoleSchema.safeParse(request.body ?? {});
    if (!result.success) {
      return reply.code(400).send({ message: 'Invalid input', issues: result.error.issues });
    }

    const employee = await employeeService.assignRole(result.data.employeeId, role.id);
    if (!employee) return reply.code(404).send({ message: 'Employee not found' });

    return { employee, role };
  });
};

export default roleRoutes;
