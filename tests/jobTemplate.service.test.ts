import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { JobTemplateService } from '../src/modules/jobTemplates/jobTemplate.service';
import { EmployeeService } from '../src/modules/employees/employee.service';

const templateService = new JobTemplateService();
const employeeService = new EmployeeService();

const createEmployee = (firstName: string) =>
  employeeService.create({
    dni: `${Math.floor(Math.random() * 1_000_000_000)}`,
    firstName,
    lastName: 'Tester',
    email: `${firstName.toLowerCase()}+${randomUUID()}@example.com`,
    taxStatus: 'registered',
    status: 'active',
    hiredAt: new Date().toISOString()
  });

describe.sequential('JobTemplateService', () => {
  it('creates templates and lists defaults', async () => {
    const template = await templateService.createTemplate({
      title: 'Emergency Response',
      description: 'Handles urgent travel & fleet incidents',
      defaultRoles: ['dispatcher', 'analyst']
    });

    expect(template.id).toBeDefined();
    expect(template.defaultRoles).toEqual(['dispatcher', 'analyst']);

    const templates = await templateService.listTemplates();
    expect(templates.length).toBeGreaterThan(0);
  });

  it('instantiates a template into a job with leader and members', async () => {
    const template = await templateService.createTemplate({
      title: 'Travel Strike Team',
      defaultRoles: ['navigator', 'coordinator']
    });

    const leader = await createEmployee('Leader');
    const memberA = await createEmployee('MemberA');
    const memberB = await createEmployee('MemberB');

    const job = await templateService.instantiate(template.id, {
      leaderId: leader.id,
      memberAssignments: [
        { employeeId: memberA.id },
        { employeeId: memberB.id, role: 'field-ops' }
      ]
    });

    expect(job.template?.id).toBe(template.id);
    expect(job.leaderId).toBe(leader.id);
    expect(job.assignments).toHaveLength(3);
    expect(job.assignments.find((assignment) => assignment.employeeId === memberA.id)?.role).toBe(
      'navigator'
    );
    expect(job.assignments.find((assignment) => assignment.employeeId === memberB.id)?.role).toBe(
      'field-ops'
    );
  });
});
