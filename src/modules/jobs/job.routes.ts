import { FastifyPluginAsync } from 'fastify';
import { jobService } from './job.service';
import { addJobMembersSchema, createJobSchema } from './job.schema';

const jobRoutes: FastifyPluginAsync = async (app) => {
  app.post('/', async (request, reply) => {
    const result = createJobSchema.safeParse(request.body);
    if (!result.success) {
      return reply.code(400).send({ message: 'Invalid input', issues: result.error.issues });
    }

    try {
      const job = await jobService.create(result.data);
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

  app.post('/:id/members', async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = addJobMembersSchema.safeParse(request.body ?? {});
    if (!result.success) {
      return reply.code(400).send({ message: 'Invalid input', issues: result.error.issues });
    }

    try {
      const job = await jobService.addMembers(id, result.data);
      reply.send(job);
    } catch (error) {
      const message = (error as Error).message;
      const status = message.includes('not found') ? 404 : 400;
      reply.code(status).send({ message });
    }
  });
};

export default jobRoutes;
