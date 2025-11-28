import { FastifyPluginAsync } from 'fastify';
import { createEmployeeSchema, updateEmployeeSchema } from './employee.schema';
import { employeeService } from './employee.service';
import { DeleteConflictError } from '../shared/errors';

const employeeRoutes: FastifyPluginAsync = async (app) => {
  app.post('/', async (request, reply) => {
    const body = createEmployeeSchema.parse(request.body);
    const employee = await employeeService.create(body);
    reply.code(201).send(employee);
  });

  app.get('/', async () => {
    return employeeService.list();
  });

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const employee = await employeeService.findById(id);
    if (!employee) {
      return reply.code(404).send({ message: 'Employee not found' });
    }

    return employee;
  });

  app.patch('/:id', async (request, reply) => {
    const body = updateEmployeeSchema.parse(request.body ?? {});
    const { id } = request.params as { id: string };

    const updated = await employeeService.update(id, body);
    if (!updated) {
      return reply.code(404).send({ message: 'Employee not found' });
    }

    return updated;
  });

  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const deleted = await employeeService.delete(id);
      if (!deleted) {
        return reply.code(404).send({ message: 'Employee not found' });
      }

      return reply.code(204).send();
    } catch (error) {
      if (error instanceof DeleteConflictError) {
        return reply.code(409).send({ message: error.message });
      }

      throw error;
    }
  });
};

export default employeeRoutes;
