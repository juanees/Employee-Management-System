import Fastify from 'fastify';
import cors from '@fastify/cors';
import { ZodError } from 'zod';
import employeeRoutes from './modules/employees/employee.routes';
import vehicleRoutes from './modules/fleet/vehicle.routes';
import travelRoutes from './modules/travel/travel.routes';
import roleRoutes from './modules/roles/role.routes';
import jobRoutes from './modules/jobs/job.routes';
import jobTemplateRoutes from './modules/jobTemplates/jobTemplate.routes';

export function buildApp() {
  const app = Fastify({
    logger: true
  });

  const allowedOrigins =
    process.env.CORS_ALLOWED_ORIGINS?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? [];

  app.register(cors, {
    origin: allowedOrigins.length > 0 ? allowedOrigins : true
  });

  app.get('/health', async () => ({ status: 'ok' }));

  app.register(employeeRoutes, { prefix: '/employees' });
  app.register(vehicleRoutes, { prefix: '/vehicles' });
  app.register(travelRoutes, { prefix: '/travel' });
  app.register(roleRoutes, { prefix: '/roles' });
  app.register(jobRoutes, { prefix: '/jobs' });
  app.register(jobTemplateRoutes, { prefix: '/job-templates' });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        error: 'Invalid input',
        error_code: 'INVALID_INPUT',
        issues: error.issues
      });
    }

    request.log.error(error);
    const statusCode = typeof (error as { statusCode?: number }).statusCode === 'number'
      ? (error as { statusCode?: number }).statusCode!
      : 500;

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return reply.code(statusCode).send({
      error: statusCode >= 500 ? 'Internal server error' : errorMessage,
      error_code: statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_FAILED'
    });
  });

  return app;
}
