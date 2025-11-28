import { FastifyPluginAsync } from 'fastify';
import { createEmployeeSchema, updateEmployeeSchema } from './employee.schema';
import { employeeService } from './employee.service';

const employeeRoutes: FastifyPluginAsync = async (app) => {
  app.post('/', async (request, reply) => {
    const result = createEmployeeSchema.safeParse(request.body);
    if (!result.success) {
      return reply.code(400).send({ message: 'Invalid input', issues: result.error.issues });
    }

    const employee = await employeeService.create(result.data);
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
    const result = updateEmployeeSchema.safeParse(request.body ?? {});
    if (!result.success) {
      return reply.code(400).send({ message: 'Invalid input', issues: result.error.issues });
    }

    const { id } = request.params as { id: string };

    const updated = await employeeService.update(id, result.data);
    if (!updated) {
      return reply.code(404).send({ message: 'Employee not found' });
    }

    return updated;
  });
};

export default employeeRoutes;
