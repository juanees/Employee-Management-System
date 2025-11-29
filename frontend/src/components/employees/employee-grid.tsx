'use client';

import { Employee } from '@/features/employees/api';

type EmployeeGridProps = {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  activeEmployeeId?: string | null;
  deletingEmployeeId?: string | null;
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
});

const formatLabel = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export function EmployeeGrid({
  employees,
  onEdit,
  onDelete,
  activeEmployeeId,
  deletingEmployeeId
}: EmployeeGridProps) {
  if (employees.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        No employees yet. Use the form on the left to add someone.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {employees.map((employee) => (
        <article
          key={employee.id}
          className={`relative flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md ${
            activeEmployeeId === employee.id ? 'ring-2 ring-slate-900' : ''
          }`}
        >
          <header className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Employee</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">
                {employee.firstName} {employee.lastName}
              </h3>
              <p className="text-sm text-slate-500">{employee.email}</p>
            </div>
            <span className="inline-flex rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              {formatLabel(employee.status)}
            </span>
          </header>

          <dl className="grid grid-cols-2 gap-3 text-sm text-slate-600">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">DNI</dt>
              <dd className="font-medium text-slate-900">{employee.dni}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Tax status</dt>
              <dd className="font-medium text-slate-900">{formatLabel(employee.taxStatus)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Hired</dt>
              <dd className="font-medium text-slate-900">
                {employee.hiredAt ? dateFormatter.format(new Date(employee.hiredAt)) : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Roles</dt>
              <dd className="font-medium text-slate-900">
                {employee.roles.length ? employee.roles.join(', ') : '—'}
              </dd>
            </div>
          </dl>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => onEdit(employee)}
              className="text-sm font-semibold text-slate-700 transition hover:text-slate-900"
            >
              Edit details
            </button>
            <button
              type="button"
              onClick={() => onDelete(employee)}
              disabled={deletingEmployeeId === employee.id}
              className="text-sm font-semibold text-rose-600 transition hover:text-rose-700 disabled:cursor-not-allowed disabled:text-rose-400"
            >
              {deletingEmployeeId === employee.id ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
