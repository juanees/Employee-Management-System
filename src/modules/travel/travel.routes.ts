import { FastifyPluginAsync } from 'fastify';
import { createTravelSchema, updateTravelSchema, updateTravelStatusSchema } from './travel.schema';
import { travelService } from './travel.service';
import { employeeService } from '../employees/employee.service';
import { vehicleService } from '../fleet/vehicle.service';

const travelRoutes: FastifyPluginAsync = async (app) => {
  app.post('/', async (request, reply) => {
    const body = createTravelSchema.parse(request.body);

    const employee = await employeeService.findById(body.employeeId);
    if (!employee) return reply.code(404).send({ message: 'Employee not found' });

    if (body.vehicleId) {
      const vehicle = await vehicleService.findById(body.vehicleId);
      if (!vehicle) return reply.code(404).send({ message: 'Vehicle not found' });
    }

    try {
      const travelRequest = await travelService.create(body);
      reply.code(201).send(travelRequest);
    } catch (error) {
      return reply.code(400).send({ error: (error as Error).message, error_code: 'REQUEST_FAILED' });
    }
  });

  app.get('/', async () => travelService.list());

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const travelRequest = await travelService.findById(id);
    if (!travelRequest) return reply.code(404).send({ message: 'Travel request not found' });
    return travelRequest;
  });

  app.patch('/:id/status', async (request, reply) => {
    const body = updateTravelStatusSchema.parse(request.body ?? {});
    const { id } = request.params as { id: string };
    try {
      const updated = await travelService.updateStatus(id, body);
      if (!updated) return reply.code(404).send({ message: 'Travel request not found' });
      return updated;
    } catch (error) {
      return reply.code(400).send({ error: (error as Error).message, error_code: 'REQUEST_FAILED' });
    }
  });

  app.patch('/:id', async (request, reply) => {
    const body = updateTravelSchema.parse(request.body ?? {});
    const { id } = request.params as { id: string };

    try {
      const updated = await travelService.updateDetails(id, body);
      if (!updated) return reply.code(404).send({ message: 'Travel request not found' });
      return updated;
    } catch (error) {
      return reply.code(400).send({ error: (error as Error).message, error_code: 'REQUEST_FAILED' });
    }
  });

  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const deleted = await travelService.delete(id);
    if (!deleted) return reply.code(404).send({ message: 'Travel request not found' });
    return reply.code(204).send();
  });
};

export default travelRoutes;
