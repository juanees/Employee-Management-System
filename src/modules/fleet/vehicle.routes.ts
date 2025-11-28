import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { createVehicleSchema, updateVehicleSchema } from './vehicle.schema';
import { vehicleService } from './vehicle.service';
import { employeeService } from '../employees/employee.service';

const assignSchema = z.object({
  employeeId: z.string().uuid().nullable().optional()
});

const vehicleRoutes: FastifyPluginAsync = async (app) => {
  app.post('/', async (request, reply) => {
    const body = createVehicleSchema.parse(request.body);
    const vehicle = await vehicleService.create(body);
    reply.code(201).send(vehicle);
  });

  app.get('/', async () => vehicleService.list());

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const vehicle = await vehicleService.findById(id);
    if (!vehicle) return reply.code(404).send({ message: 'Vehicle not found' });
    return vehicle;
  });

  app.patch('/:id', async (request, reply) => {
    const body = updateVehicleSchema.parse(request.body ?? {});
    const { id } = request.params as { id: string };
    const updated = await vehicleService.update(id, body);
    if (!updated) return reply.code(404).send({ message: 'Vehicle not found' });
    return updated;
  });

  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const deleted = await vehicleService.delete(id);
    if (!deleted) return reply.code(404).send({ message: 'Vehicle not found' });
    return reply.code(204).send();
  });

  app.post('/:id/assign', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = assignSchema.parse(request.body ?? {});

    if (body.employeeId) {
      const employee = await employeeService.findById(body.employeeId);
      if (!employee) {
        return reply.code(404).send({ message: 'Employee not found' });
      }
    }

    const updated = await vehicleService.assignEmployee(id, body.employeeId ?? null);
    if (!updated) return reply.code(404).send({ message: 'Vehicle not found' });
    return updated;
  });
};

export default vehicleRoutes;
