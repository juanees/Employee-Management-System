import { FastifyPluginAsync } from 'fastify';
import { createEmployeeSchema, updateEmployeeSchema } from './employee.schema';
import { employeeService } from './employee.service';

const employeeRoutes: FastifyPluginAsync = async (app) => {
  app.post('/', async (request, reply) => {
    const body = createEmployeeSchema.parse(request.body);
    const employee = employeeService.create(body);
    reply.code(201).send(employee);
  });

  app.get('/', async () => {
    return employeeService.list();
  });

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const employee = employeeService.findById(id);
    if (!employee) {
      return reply.code(404).send({ message: 'Employee not found' });
    }

    return employee;
  });

  app.patch('/:id', async (request, reply) => {
    const body = updateEmployeeSchema.parse(request.body ?? {});
    const { id } = request.params as { id: string };

    const updated = employeeService.update(id, body);
    if (!updated) {
      return reply.code(404).send({ message: 'Employee not found' });
    }

    return updated;
  });
};

export default employeeRoutes;
