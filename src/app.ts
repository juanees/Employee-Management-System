import Fastify from 'fastify';
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

  app.get('/health', async () => ({ status: 'ok' }));

  app.register(employeeRoutes, { prefix: '/employees' });
  app.register(vehicleRoutes, { prefix: '/vehicles' });
  app.register(travelRoutes, { prefix: '/travel' });
  app.register(roleRoutes, { prefix: '/roles' });
  app.register(jobRoutes, { prefix: '/jobs' });
  app.register(jobTemplateRoutes, { prefix: '/job-templates' });

  return app;
}
