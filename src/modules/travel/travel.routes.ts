import { FastifyPluginAsync } from 'fastify';
import { ZodError } from 'zod';
import { createTravelSchema, updateTravelStatusSchema } from './travel.schema';
import { travelService } from './travel.service';
import { employeeService } from '../employees/employee.service';
import { vehicleService } from '../fleet/vehicle.service';

const travelRoutes: FastifyPluginAsync = async (app) => {
  app.post('/', async (request, reply) => {
    try {
      const body = createTravelSchema.parse(request.body);

      const employee = employeeService.findById(body.employeeId);
      if (!employee) return reply.code(404).send({ message: 'Employee not found' });

      if (body.vehicleId) {
        const vehicle = vehicleService.findById(body.vehicleId);
        if (!vehicle) return reply.code(404).send({ message: 'Vehicle not found' });
      }

      const travelRequest = travelService.create(body);
      reply.code(201).send(travelRequest);
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.code(400).send({ message: 'Invalid input', issues: error.issues });
      }

      return reply.code(400).send({ message: (error as Error).message });
    }
  });

  app.get('/', async () => travelService.list());

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const travelRequest = travelService.findById(id);
    if (!travelRequest) return reply.code(404).send({ message: 'Travel request not found' });
    return travelRequest;
  });

  app.patch('/:id/status', async (request, reply) => {
    try {
      const body = updateTravelStatusSchema.parse(request.body ?? {});
      const { id } = request.params as { id: string };
      const updated = travelService.updateStatus(id, body);
      if (!updated) return reply.code(404).send({ message: 'Travel request not found' });
      return updated;
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.code(400).send({ message: 'Invalid input', issues: error.issues });
      }
      return reply.code(400).send({ message: (error as Error).message });
    }
  });
};

export default travelRoutes;
