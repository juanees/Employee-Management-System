import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { ZodError } from 'zod';
import employeeRoutes from './modules/employees/employee.routes';
import vehicleRoutes from './modules/fleet/vehicle.routes';
import travelRoutes from './modules/travel/travel.routes';
import roleRoutes from './modules/roles/role.routes';
import jobRoutes from './modules/jobs/job.routes';
import jobTemplateRoutes from './modules/jobTemplates/jobTemplate.routes';

export function buildApp() {
  const logLevel = process.env.LOG_LEVEL ?? 'debug';
  const app = Fastify({
    logger: {
      level: logLevel
    }
  });

  const allowedOrigins =
    process.env.CORS_ALLOWED_ORIGINS?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? [];

  app.addHook('onRequest', async (request) => {
    (request as typeof request & { debugStartTime?: bigint }).debugStartTime = process.hrtime.bigint();
    request.log.debug(
      {
        reqId: request.id,
        method: request.method,
        url: request.url,
        ip: request.ip,
        params: request.params,
        query: request.query
      },
      'Incoming request'
    );
  });

  app.addHook('onResponse', async (request, reply) => {
    const { debugStartTime } = request as typeof request & { debugStartTime?: bigint };
    const responseTimeMs =
      typeof debugStartTime === 'bigint'
        ? Number(process.hrtime.bigint() - debugStartTime) / 1_000_000
        : undefined;
    request.log.debug(
      {
        reqId: request.id,
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTimeMs,
        contentLength: reply.getHeader('content-length')
      },
      'Request completed'
    );
  });

  app.register(cors, {
    origin: allowedOrigins.length > 0 ? allowedOrigins : true
  });
  app.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024 // 5 MB CSVs are plenty for bulk imports
    }
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
