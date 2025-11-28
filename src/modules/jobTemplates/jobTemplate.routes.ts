import { FastifyPluginAsync } from 'fastify';
import { jobTemplateService } from './jobTemplate.service';
import { createJobTemplateSchema, instantiateJobTemplateSchema } from './jobTemplate.schema';

const jobTemplateRoutes: FastifyPluginAsync = async (app) => {
  app.post('/', async (request, reply) => {
    const result = createJobTemplateSchema.safeParse(request.body);
    if (!result.success) {
      return reply.code(400).send({ message: 'Invalid input', issues: result.error.issues });
    }

    const template = await jobTemplateService.createTemplate(result.data);
    reply.code(201).send(template);
  });

  app.get('/', async () => jobTemplateService.listTemplates());

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const template = await jobTemplateService.findById(id);
    if (!template) return reply.code(404).send({ message: 'Template not found' });
    return template;
  });

  app.post('/:id/instantiate', async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = instantiateJobTemplateSchema.safeParse(request.body ?? {});
    if (!result.success) {
      return reply.code(400).send({ message: 'Invalid input', issues: result.error.issues });
    }

    try {
      const job = await jobTemplateService.instantiate(id, result.data);
      reply.code(201).send(job);
    } catch (error) {
      const message = (error as Error).message;
      const status = message.includes('not found') ? 404 : 400;
      reply.code(status).send({ message });
    }
  });
};

export default jobTemplateRoutes;
