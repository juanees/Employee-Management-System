import { QueryKey } from '@tanstack/react-query';
import { ReactNode } from 'react';

import type {
  CreateEmployeeRequest,
  Employee,
  UpdateEmployeeRequest
} from '@/features/employees/api';
import {
  createEmployee,
  deleteEmployee,
  listEmployees,
  updateEmployee
} from '@/features/employees/api';
import type {
  CreateJobRequest,
  Job,
  UpdateJobRequest
} from '@/features/jobs/api';
import { createJob, deleteJob, listJobs, updateJob } from '@/features/jobs/api';
import type {
  CreateJobTemplateRequest,
  JobTemplate,
  UpdateJobTemplateRequest
} from '@/features/job-templates/api';
import {
  createJobTemplate,
  deleteJobTemplate,
  listJobTemplates,
  updateJobTemplate
} from '@/features/job-templates/api';
import type { CreateRoleRequest, Role, UpdateRoleRequest } from '@/features/roles/api';
import { createRole, deleteRole, listRoles, updateRole } from '@/features/roles/api';
import type {
  CreateTravelRequest,
  TravelRequest,
  UpdateTravelRequest
} from '@/features/travel/api';
import {
  createTravelRequest,
  deleteTravelRequest,
  listTravelRequests,
  updateTravelRequest
} from '@/features/travel/api';
import type {
  CreateVehicleRequest,
  UpdateVehicleRequest,
  Vehicle
} from '@/features/vehicles/api';
import {
  createVehicle,
  deleteVehicle,
  listVehicles,
  updateVehicle
} from '@/features/vehicles/api';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  try {
    return dateFormatter.format(new Date(value));
  } catch {
    return value;
  }
};

const joinList = (items?: string[]) => {
  if (!items || items.length === 0) return '—';
  return items.join(', ');
};

export type ResourceColumn<T extends { id: string }> = {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
};

export type ResourceDetailField<T extends { id: string }> = {
  key: string;
  label: string;
  render: (item: T) => ReactNode;
};

export type ResourceDefinition<T extends { id: string }> = {
  slug: string;
  title: string;
  description: string;
  entityName: string;
  queryKey: QueryKey;
  listFn: () => Promise<T[]>;
  createFn: (payload: unknown) => Promise<unknown>;
  updateFn?: (id: string, payload: unknown) => Promise<unknown>;
  deleteFn: (id: string) => Promise<unknown>;
  createTemplate: Record<string, unknown>;
  updateTemplate?: Record<string, unknown>;
  preview: (item: T) => ReactNode;
  columns: Array<ResourceColumn<T>>;
  detailFields: Array<ResourceDetailField<T>>;
};

const employeeDefinition: ResourceDefinition<Employee> = {
  slug: 'employees',
  title: 'Employees',
  description: 'Core roster with tax and employment status.',
  entityName: 'Employee',
  queryKey: ['employees'],
  listFn: listEmployees,
  createFn: (payload) => createEmployee(payload as CreateEmployeeRequest),
  updateFn: (id, payload) => updateEmployee(id, payload as UpdateEmployeeRequest),
  deleteFn: (id) => deleteEmployee(id),
  createTemplate: {
    dni: '12345678',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    taxStatus: 'registered',
    status: 'active'
  },
  updateTemplate: {
    status: 'inactive',
    taxStatus: 'withholding'
  },
  preview: (employee) => (
    <div className="flex items-center justify-between text-sm">
      <div>
        <p className="font-semibold text-slate-800">
          {employee.firstName} {employee.lastName}
        </p>
        <p className="text-xs text-slate-500">{employee.email}</p>
      </div>
      <span className="text-xs font-semibold uppercase text-slate-500">{employee.status}</span>
    </div>
  ),
  columns: [
    {
      key: 'name',
      header: 'Name',
      render: (employee) => (
        <span className="font-medium text-slate-900">
          {employee.firstName} {employee.lastName}
        </span>
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (employee) => <span className="text-slate-500">{employee.email}</span>
    },
    {
      key: 'status',
      header: 'Status',
      render: (employee) => (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase text-slate-700">
          {employee.status}
        </span>
      )
    },
    {
      key: 'taxStatus',
      header: 'Tax',
      render: (employee) => <span className="text-xs uppercase text-slate-500">{employee.taxStatus}</span>
    }
  ],
  detailFields: [
    {
      key: 'id',
      label: 'Employee ID',
      render: (employee) => <code className="text-xs text-slate-500">{employee.id}</code>
    },
    {
      key: 'dni',
      label: 'National ID',
      render: (employee) => employee.dni
    },
    {
      key: 'email',
      label: 'Email',
      render: (employee) => employee.email
    },
    {
      key: 'status',
      label: 'Status',
      render: (employee) => employee.status
    },
    {
      key: 'taxStatus',
      label: 'Tax status',
      render: (employee) => employee.taxStatus
    },
    {
      key: 'roles',
      label: 'Roles',
      render: (employee) => joinList(employee.roles)
    },
    {
      key: 'hiredAt',
      label: 'Hired at',
      render: (employee) => formatDate(employee.hiredAt)
    },
    {
      key: 'createdAt',
      label: 'Created at',
      render: (employee) => formatDate(employee.createdAt)
    },
    {
      key: 'updatedAt',
      label: 'Updated at',
      render: (employee) => formatDate(employee.updatedAt)
    }
  ]
};

const vehicleDefinition: ResourceDefinition<Vehicle> = {
  slug: 'vehicles',
  title: 'Vehicles',
  description: 'Fleet availability tracking.',
  entityName: 'Vehicle',
  queryKey: ['vehicles'],
  listFn: listVehicles,
  createFn: (payload) => createVehicle(payload as CreateVehicleRequest),
  updateFn: (id, payload) => updateVehicle(id, payload as UpdateVehicleRequest),
  deleteFn: (id) => deleteVehicle(id),
  createTemplate: {
    plateNumber: 'ABC123',
    model: 'Transit',
    year: 2024,
    insuranceExpiresOn: '2030-01-01T00:00:00.000Z',
    vtvExpiresOn: '2030-06-01T00:00:00.000Z',
    status: 'available'
  },
  updateTemplate: {
    status: 'maintenance',
    assignedEmployeeId: null
  },
  preview: (vehicle) => (
    <div className="flex items-center justify-between text-sm">
      <div>
        <p className="font-semibold text-slate-800">{vehicle.plateNumber}</p>
        <p className="text-xs text-slate-500">
          {vehicle.model} · {vehicle.year}
        </p>
      </div>
      <span className="text-xs font-semibold uppercase text-slate-500">{vehicle.status}</span>
    </div>
  ),
  columns: [
    {
      key: 'plate',
      header: 'Plate',
      render: (vehicle) => <span className="font-medium text-slate-900">{vehicle.plateNumber}</span>
    },
    {
      key: 'model',
      header: 'Model',
      render: (vehicle) => (
        <span className="text-slate-500">
          {vehicle.model} · {vehicle.year}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (vehicle) => (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase text-slate-700">
          {vehicle.status}
        </span>
      )
    },
    {
      key: 'assigned',
      header: 'Assigned To',
      render: (vehicle) => vehicle.assignedEmployeeId ?? 'Unassigned'
    }
  ],
  detailFields: [
    {
      key: 'id',
      label: 'Vehicle ID',
      render: (vehicle) => <code className="text-xs text-slate-500">{vehicle.id}</code>
    },
    {
      key: 'insurance',
      label: 'Insurance expires',
      render: (vehicle) => formatDate(vehicle.insuranceExpiresOn)
    },
    {
      key: 'vtv',
      label: 'VTV expires',
      render: (vehicle) => formatDate(vehicle.vtvExpiresOn)
    },
    {
      key: 'assignedEmployeeId',
      label: 'Assigned employee',
      render: (vehicle) => vehicle.assignedEmployeeId ?? 'Unassigned'
    },
    {
      key: 'status',
      label: 'Status',
      render: (vehicle) => vehicle.status
    },
    {
      key: 'createdAt',
      label: 'Created at',
      render: (vehicle) => formatDate(vehicle.createdAt)
    },
    {
      key: 'updatedAt',
      label: 'Updated at',
      render: (vehicle) => formatDate(vehicle.updatedAt)
    }
  ]
};

const travelDefinition: ResourceDefinition<TravelRequest> = {
  slug: 'travel',
  title: 'Travel requests',
  description: 'Trip planning incl. approvals.',
  entityName: 'Travel request',
  queryKey: ['travel'],
  listFn: listTravelRequests,
  createFn: (payload) => createTravelRequest(payload as CreateTravelRequest),
  updateFn: (id, payload) => updateTravelRequest(id, payload as UpdateTravelRequest),
  deleteFn: (id) => deleteTravelRequest(id),
  createTemplate: {
    employeeId: 'EMPLOYEE_ID',
    origin: 'HQ',
    destination: 'Client Site',
    startDate: '2030-01-01T09:00:00.000Z',
    endDate: '2030-01-05T18:00:00.000Z',
    purpose: 'Implementation'
  },
  updateTemplate: {
    destination: 'Client HQ',
    status: 'approved',
    approverComments: 'Safe travels!'
  },
  preview: (travel) => (
    <div className="flex items-center justify-between text-sm">
      <div>
        <p className="font-semibold text-slate-800">
          {travel.origin} → {travel.destination}
        </p>
        <p className="text-xs text-slate-500">{travel.purpose}</p>
      </div>
      <span className="text-xs font-semibold uppercase text-slate-500">{travel.status}</span>
    </div>
  ),
  columns: [
    {
      key: 'route',
      header: 'Route',
      render: (travel) => (
        <span className="font-medium text-slate-900">
          {travel.origin} → {travel.destination}
        </span>
      )
    },
    {
      key: 'employee',
      header: 'Employee',
      render: (travel) => travel.employeeId
    },
    {
      key: 'status',
      header: 'Status',
      render: (travel) => (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase text-slate-700">
          {travel.status}
        </span>
      )
    },
    {
      key: 'window',
      header: 'Window',
      render: (travel) => (
        <span className="text-xs text-slate-500">
          {formatDate(travel.startDate)} – {formatDate(travel.endDate)}
        </span>
      )
    }
  ],
  detailFields: [
    {
      key: 'id',
      label: 'Request ID',
      render: (travel) => <code className="text-xs text-slate-500">{travel.id}</code>
    },
    {
      key: 'purpose',
      label: 'Purpose',
      render: (travel) => travel.purpose
    },
    {
      key: 'employeeId',
      label: 'Employee ID',
      render: (travel) => travel.employeeId
    },
    {
      key: 'vehicleId',
      label: 'Vehicle ID',
      render: (travel) => travel.vehicleId ?? 'Unassigned'
    },
    {
      key: 'dates',
      label: 'Dates',
      render: (travel) => `${formatDate(travel.startDate)} → ${formatDate(travel.endDate)}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (travel) => travel.status
    },
    {
      key: 'approverComments',
      label: 'Approver comments',
      render: (travel) => travel.approverComments ?? '—'
    },
    {
      key: 'createdAt',
      label: 'Created at',
      render: (travel) => formatDate(travel.createdAt)
    },
    {
      key: 'updatedAt',
      label: 'Updated at',
      render: (travel) => formatDate(travel.updatedAt)
    }
  ]
};

const roleDefinition: ResourceDefinition<Role> = {
  slug: 'roles',
  title: 'Roles',
  description: 'Permission bundles applied to employees.',
  entityName: 'Role',
  queryKey: ['roles'],
  listFn: listRoles,
  createFn: (payload) => createRole(payload as CreateRoleRequest),
  updateFn: (id, payload) => updateRole(id, payload as UpdateRoleRequest),
  deleteFn: (id) => deleteRole(id),
  createTemplate: {
    name: 'travel-manager',
    description: 'Approves trips',
    permissions: ['travel:approve', 'travel:view']
  },
  updateTemplate: {
    description: 'Approves & reviews trips',
    permissions: ['travel:approve', 'travel:view', 'travel:comment']
  },
  preview: (role) => (
    <div className="flex items-center justify-between text-sm">
      <div>
        <p className="font-semibold text-slate-800">{role.name}</p>
        <p className="text-xs text-slate-500">{joinList(role.permissions.slice(0, 2))}</p>
      </div>
      <span className="text-xs font-semibold uppercase text-slate-500">
        {role.permissions.length} perms
      </span>
    </div>
  ),
  columns: [
    {
      key: 'name',
      header: 'Name',
      render: (role) => <span className="font-medium text-slate-900">{role.name}</span>
    },
    {
      key: 'description',
      header: 'Description',
      render: (role) => role.description ?? '—'
    },
    {
      key: 'permissions',
      header: 'Permissions',
      render: (role) => role.permissions.length
    }
  ],
  detailFields: [
    {
      key: 'id',
      label: 'Role ID',
      render: (role) => <code className="text-xs text-slate-500">{role.id}</code>
    },
    {
      key: 'description',
      label: 'Description',
      render: (role) => role.description ?? '—'
    },
    {
      key: 'permissions',
      label: 'Permissions',
      render: (role) => joinList(role.permissions)
    },
    {
      key: 'createdAt',
      label: 'Created at',
      render: (role) => formatDate(role.createdAt)
    },
    {
      key: 'updatedAt',
      label: 'Updated at',
      render: (role) => formatDate(role.updatedAt)
    }
  ]
};

const jobDefinition: ResourceDefinition<Job> = {
  slug: 'jobs',
  title: 'Jobs',
  description: 'Project teams with leaders + assignments.',
  entityName: 'Job',
  queryKey: ['jobs'],
  listFn: listJobs,
  createFn: (payload) => createJob(payload as CreateJobRequest),
  updateFn: (id, payload) => updateJob(id, payload as UpdateJobRequest),
  deleteFn: (id) => deleteJob(id),
  createTemplate: {
    title: 'Emergency Response',
    description: 'Rapid response crew',
    leaderId: 'EMPLOYEE_ID',
    memberIds: ['EMPLOYEE_ID_B']
  },
  updateTemplate: {
    description: 'Rapid response & support',
    templateId: null
  },
  preview: (job) => (
    <div className="flex items-center justify-between text-sm">
      <div>
        <p className="font-semibold text-slate-800">{job.title}</p>
        <p className="text-xs text-slate-500">
          Leader {job.leader.firstName} {job.leader.lastName}
        </p>
      </div>
      <span className="text-xs font-semibold uppercase text-slate-500">
        {job.assignments.length} members
      </span>
    </div>
  ),
  columns: [
    {
      key: 'title',
      header: 'Title',
      render: (job) => <span className="font-medium text-slate-900">{job.title}</span>
    },
    {
      key: 'leader',
      header: 'Leader',
      render: (job) => `${job.leader.firstName} ${job.leader.lastName}`
    },
    {
      key: 'members',
      header: 'Members',
      render: (job) => job.assignments.length,
      align: 'center'
    },
    {
      key: 'template',
      header: 'Template',
      render: (job) => job.template?.title ?? '—'
    }
  ],
  detailFields: [
    {
      key: 'id',
      label: 'Job ID',
      render: (job) => <code className="text-xs text-slate-500">{job.id}</code>
    },
    {
      key: 'description',
      label: 'Description',
      render: (job) => job.description ?? '—'
    },
    {
      key: 'leader',
      label: 'Leader',
      render: (job) => `${job.leader.firstName} ${job.leader.lastName}`
    },
    {
      key: 'template',
      label: 'Template',
      render: (job) => job.template?.title ?? 'Custom'
    },
    {
      key: 'assignments',
      label: 'Assignments',
      render: (job) =>
        job.assignments.length > 0
          ? job.assignments.map((assignment) => assignment.employee?.email ?? assignment.employeeId).join(', ')
          : 'No members'
    },
    {
      key: 'createdAt',
      label: 'Created at',
      render: (job) => formatDate(job.createdAt)
    },
    {
      key: 'updatedAt',
      label: 'Updated at',
      render: (job) => formatDate(job.updatedAt)
    }
  ]
};

const jobTemplateDefinition: ResourceDefinition<JobTemplate> = {
  slug: 'job-templates',
  title: 'Job templates',
  description: 'Reusable team blueprints.',
  entityName: 'Job template',
  queryKey: ['job-templates'],
  listFn: listJobTemplates,
  createFn: (payload) => createJobTemplate(payload as CreateJobTemplateRequest),
  updateFn: (id, payload) => updateJobTemplate(id, payload as UpdateJobTemplateRequest),
  deleteFn: (id) => deleteJobTemplate(id),
  createTemplate: {
    title: 'Travel Strike Team',
    description: 'Handles escalated travel',
    defaultRoles: ['navigator', 'coordinator']
  },
  updateTemplate: {
    description: 'Handles escalations + audits',
    defaultRoles: ['navigator', 'auditor']
  },
  preview: (template) => (
    <div className="flex items-center justify-between text-sm">
      <div>
        <p className="font-semibold text-slate-800">{template.title}</p>
        <p className="text-xs text-slate-500">{joinList(template.defaultRoles)}</p>
      </div>
      <span className="text-xs font-semibold uppercase text-slate-500">
        {template.defaultRoles.length} roles
      </span>
    </div>
  ),
  columns: [
    {
      key: 'title',
      header: 'Title',
      render: (template) => <span className="font-medium text-slate-900">{template.title}</span>
    },
    {
      key: 'description',
      header: 'Description',
      render: (template) => template.description ?? '—'
    },
    {
      key: 'roles',
      header: 'Roles',
      render: (template) => template.defaultRoles.length,
      align: 'center'
    }
  ],
  detailFields: [
    {
      key: 'id',
      label: 'Template ID',
      render: (template) => <code className="text-xs text-slate-500">{template.id}</code>
    },
    {
      key: 'description',
      label: 'Description',
      render: (template) => template.description ?? '—'
    },
    {
      key: 'roles',
      label: 'Default roles',
      render: (template) => joinList(template.defaultRoles)
    },
    {
      key: 'createdAt',
      label: 'Created at',
      render: (template) => formatDate(template.createdAt)
    },
    {
      key: 'updatedAt',
      label: 'Updated at',
      render: (template) => formatDate(template.updatedAt)
    }
  ]
};

export const resourceDefinitions = [
  employeeDefinition,
  vehicleDefinition,
  travelDefinition,
  roleDefinition,
  jobDefinition,
  jobTemplateDefinition
] as const;

export type ResourceDefinitionEntry = (typeof resourceDefinitions)[number];
export type ResourceSlug = ResourceDefinitionEntry['slug'];

export function getResourceDefinition(slug: string): ResourceDefinitionEntry | undefined {
  return resourceDefinitions.find((resource) => resource.slug === slug);
}

export function requireResourceDefinition(slug: ResourceSlug): ResourceDefinitionEntry {
  const definition = getResourceDefinition(slug);
  if (!definition) {
    throw new Error(`Resource definition missing for slug "${slug}"`);
  }
  return definition;
}
