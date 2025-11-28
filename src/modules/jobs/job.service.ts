import { Job as JobModel, JobAssignment as JobAssignmentModel } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AddJobMembersInput, CreateJobInput } from './job.schema';
import { Job, JobAssignment } from './job.types';

const jobInclude = {
  leader: true,
  template: {
    select: {
      id: true,
      title: true
    }
  },
  assignments: {
    include: {
      employee: true
    }
  }
};

const roleFromRecord = (role: string | null): JobAssignment['role'] =>
  role === 'leader' ? 'leader' : role ?? 'member';

const toAssignment = (record: JobAssignmentModel & { employee: { id: string; firstName: string; lastName: string; email: string } }): JobAssignment => ({
  id: record.id,
  jobId: record.jobId,
  employeeId: record.employeeId,
  role: roleFromRecord(record.role),
  employee: record.employee
    ? {
        id: record.employee.id,
        firstName: record.employee.firstName,
        lastName: record.employee.lastName,
        email: record.employee.email
      }
    : undefined,
  createdAt: record.createdAt.toISOString(),
  updatedAt: record.updatedAt.toISOString()
});

const toDomain = (job: JobModel & {
  leader: { id: string; firstName: string; lastName: string; email: string };
  template: { id: string; title: string } | null;
  assignments: Array<JobAssignmentModel & { employee: { id: string; firstName: string; lastName: string; email: string } }>;
}): Job => ({
  id: job.id,
  title: job.title,
  description: job.description ?? undefined,
  leaderId: job.leaderId,
  leader: {
    id: job.leader.id,
    firstName: job.leader.firstName,
    lastName: job.leader.lastName,
    email: job.leader.email
  },
  template: job.template ?? undefined,
  assignments: job.assignments.map(toAssignment),
  createdAt: job.createdAt.toISOString(),
  updatedAt: job.updatedAt.toISOString()
});

const uniqueIds = (ids: string[]) => Array.from(new Set(ids));

export class JobService {
  constructor(private readonly client = prisma) {}

  async create(payload: CreateJobInput): Promise<Job> {
    const leader = await this.client.employee.findUnique({ where: { id: payload.leaderId } });
    if (!leader) throw new Error('Leader not found');

    const memberIds = uniqueIds(payload.memberIds ?? []).filter((id) => id !== payload.leaderId);
    if (memberIds.length) {
      const members = await this.client.employee.findMany({ where: { id: { in: memberIds } } });
      if (members.length !== memberIds.length) {
        throw new Error('One or more members were not found');
      }
    }

    const job = await this.client.job.create({
      data: {
        title: payload.title,
        description: payload.description,
        leaderId: payload.leaderId,
        assignments: {
          create: [
            { employeeId: payload.leaderId, role: 'leader' },
            ...memberIds.map((employeeId) => ({ employeeId, role: 'member' as const }))
          ]
        }
      },
      include: jobInclude
    });

    return toDomain(job);
  }

  async list(): Promise<Job[]> {
    const jobs = await this.client.job.findMany({
      orderBy: { createdAt: 'desc' },
      include: jobInclude
    });
    return jobs.map(toDomain);
  }

  async findById(id: string): Promise<Job | null> {
    const job = await this.client.job.findUnique({ where: { id }, include: jobInclude });
    return job ? toDomain(job) : null;
  }

  async addMembers(jobId: string, payload: AddJobMembersInput): Promise<Job> {
    const job = await this.client.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error('Job not found');

    const existingAssignments = await this.client.jobAssignment.findMany({
      where: { jobId },
      select: { employeeId: true }
    });
    const existingIds = new Set(existingAssignments.map((assignment) => assignment.employeeId));

    const newMemberIds = uniqueIds(payload.employeeIds).filter((id) => !existingIds.has(id));
    if (!newMemberIds.length) {
      const refreshed = await this.client.job.findUnique({ where: { id: jobId }, include: jobInclude });
      if (!refreshed) throw new Error('Job not found');
      return toDomain(refreshed);
    }

    const members = await this.client.employee.findMany({ where: { id: { in: newMemberIds } } });
    if (members.length !== newMemberIds.length) {
      throw new Error('One or more members were not found');
    }

    await this.client.jobAssignment.createMany({
      data: newMemberIds.map((employeeId) => ({ jobId, employeeId, role: 'member' }))
    });

    const updated = await this.client.job.findUnique({ where: { id: jobId }, include: jobInclude });
    if (!updated) throw new Error('Job not found');
    return toDomain(updated);
  }
}

export const jobService = new JobService();
