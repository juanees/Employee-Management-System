import { FastifyPluginAsync } from 'fastify';
import { jobService } from './job.service';
import { addJobMembersSchema, createJobSchema, updateJobSchema } from './job.schema';

const jobRoutes: FastifyPluginAsync = async (app) => {
  app.post('/', async (request, reply) => {
    const body = createJobSchema.parse(request.body);
    try {
      const job = await jobService.create(body);
      reply.code(201).send(job);
    } catch (error) {
      reply.code(400).send({ message: (error as Error).message });
    }
  });

  app.get('/', async () => jobService.list());

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const job = await jobService.findById(id);
    if (!job) return reply.code(404).send({ message: 'Job not found' });
    return job;
  });

  app.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = updateJobSchema.parse(request.body ?? {});

    try {
      const job = await jobService.update(id, body);
      if (!job) return reply.code(404).send({ message: 'Job not found' });
      return job;
    } catch (error) {
      return reply.code(400).send({ message: (error as Error).message });
    }
  });

  app.post('/:id/members', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = addJobMembersSchema.parse(request.body ?? {});
    try {
      const job = await jobService.addMembers(id, body);
      reply.send(job);
    } catch (error) {
      const message = (error as Error).message;
      const status = message.includes('not found') ? 404 : 400;
      reply.code(status).send({ message });
    }
  });

  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const deleted = await jobService.delete(id);
    if (!deleted) return reply.code(404).send({ message: 'Job not found' });
    return reply.code(204).send();
  });
};

export default jobRoutes;
