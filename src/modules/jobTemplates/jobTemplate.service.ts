import { JobTemplate as PrismaJobTemplate } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { JobTemplate } from './jobTemplate.types';
import {
  CreateJobTemplateInput,
  InstantiateJobTemplateInput
} from './jobTemplate.schema';
import { jobService } from '../jobs/job.service';
import { Job } from '../jobs/job.types';

const parseRoles = (roles: string) => {
  try {
    const parsed = JSON.parse(roles);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch (error) {
    return [];
  }
};

const toTemplate = (record: PrismaJobTemplate): JobTemplate => ({
  id: record.id,
  title: record.title,
  description: record.description ?? undefined,
  defaultRoles: parseRoles(record.defaultRoles),
  createdAt: record.createdAt.toISOString(),
  updatedAt: record.updatedAt.toISOString()
});

const uniqueBy = <T extends { employeeId: string }>(items: T[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.employeeId)) return false;
    seen.add(item.employeeId);
    return true;
  });
};

export class JobTemplateService {
  constructor(private readonly client = prisma) {}

  async createTemplate(payload: CreateJobTemplateInput): Promise<JobTemplate> {
    const template = await this.client.jobTemplate.create({
      data: {
        title: payload.title,
        description: payload.description,
        defaultRoles: JSON.stringify(payload.defaultRoles ?? [])
      }
    });

    return toTemplate(template);
  }

  async listTemplates(): Promise<JobTemplate[]> {
    const templates = await this.client.jobTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return templates.map(toTemplate);
  }

  async findById(id: string): Promise<JobTemplate | null> {
    const template = await this.client.jobTemplate.findUnique({ where: { id } });
    return template ? toTemplate(template) : null;
  }

  async instantiate(templateId: string, payload: InstantiateJobTemplateInput): Promise<Job> {
    const templateRecord = await this.client.jobTemplate.findUnique({ where: { id: templateId } });
    if (!templateRecord) {
      throw new Error('Template not found');
    }

    const leader = await this.client.employee.findUnique({ where: { id: payload.leaderId } });
    if (!leader) {
      throw new Error('Leader not found');
    }

    const defaultRoles = parseRoles(templateRecord.defaultRoles);

    const assignmentsInput = uniqueBy(payload.memberAssignments ?? []).filter(
      (assignment) => assignment.employeeId !== payload.leaderId
    );

    const memberIds = assignmentsInput.map((assignment) => assignment.employeeId);
    if (memberIds.length) {
      const members = await this.client.employee.findMany({ where: { id: { in: memberIds } } });
      if (members.length !== memberIds.length) {
        throw new Error('One or more members were not found');
      }
    }

    const memberAssignments = assignmentsInput.map((assignment, index) => ({
      employeeId: assignment.employeeId,
      role: assignment.role ?? defaultRoles[index] ?? 'member'
    }));

    const jobRecord = await this.client.job.create({
      data: {
        title: payload.title ?? templateRecord.title,
        description: payload.description ?? templateRecord.description,
        leaderId: payload.leaderId,
        templateId,
        assignments: {
          create: [
            { employeeId: payload.leaderId, role: 'leader' },
            ...memberAssignments
          ]
        }
      }
    });

    const job = await jobService.findById(jobRecord.id);
    if (!job) throw new Error('Failed to load job after instantiation');
    return job;
  }
}

export const jobTemplateService = new JobTemplateService();
