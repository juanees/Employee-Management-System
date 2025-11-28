import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { JobService } from '../src/modules/jobs/job.service';
import { EmployeeService } from '../src/modules/employees/employee.service';
import { JobTemplateService } from '../src/modules/jobTemplates/jobTemplate.service';

const jobService = new JobService();
const employeeService = new EmployeeService();
const jobTemplateService = new JobTemplateService();

const createEmployee = () =>
  employeeService.create({
    dni: `${Math.floor(Math.random() * 1_000_000_000)}`,
    firstName: 'Test',
    lastName: 'User',
    email: `test+${randomUUID()}@example.com`,
    taxStatus: 'registered',
    status: 'active',
    hiredAt: new Date().toISOString()
  });

describe.sequential('JobService', () => {
  it('creates job with leader and members', async () => {
    const leader = await createEmployee();
    const member = await createEmployee();

    const job = await jobService.create({
      title: 'Platform Team',
      description: 'Handles core services',
      leaderId: leader.id,
      memberIds: [member.id]
    });

    expect(job.leaderId).toBe(leader.id);
    expect(job.assignments).toHaveLength(2);
    expect(job.assignments.find((assignment) => assignment.employeeId === leader.id)?.role).toBe('leader');
    expect(job.assignments.find((assignment) => assignment.employeeId === member.id)?.role).toBe('member');
  });

  it('adds additional members to an existing job', async () => {
    const leader = await createEmployee();
    const memberA = await createEmployee();
    const memberB = await createEmployee();

    const job = await jobService.create({
      title: 'Travel Ops',
      leaderId: leader.id,
      memberIds: [memberA.id]
    });

    const updated = await jobService.addMembers(job.id, { employeeIds: [memberB.id] });
    expect(updated.assignments).toHaveLength(3);
    expect(updated.assignments.find((assignment) => assignment.employeeId === memberB.id)?.role).toBe('member');
  });

  it('updates job metadata and links templates', async () => {
    const leader = await createEmployee();
    const job = await jobService.create({
      title: 'Ops',
      leaderId: leader.id
    });

    const template = await jobTemplateService.createTemplate({
      title: 'Ops Template',
      defaultRoles: ['navigator']
    });

    const updated = await jobService.update(job.id, {
      description: 'Updated description',
      templateId: template.id
    });

    expect(updated?.description).toBe('Updated description');
    expect(updated?.template?.id).toBe(template.id);
  });

  it('deletes jobs and reports missing ones', async () => {
    const leader = await createEmployee();
    const job = await jobService.create({
      title: 'Temp Ops',
      leaderId: leader.id
    });

    const deleted = await jobService.delete(job.id);
    expect(deleted).toBe(true);
    const secondAttempt = await jobService.delete(job.id);
    expect(secondAttempt).toBe(false);
  });
});
