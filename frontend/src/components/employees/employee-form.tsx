'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { Employee, EmployeeStatus, TaxStatus } from '@/features/employees/api';

export type EmployeeFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  dni: string;
  status: EmployeeStatus;
  taxStatus: TaxStatus;
  hiredAt: string;
  rolesCsv: string;
};

type EmployeeFormProps = {
  mode: 'create' | 'edit';
  initialEmployee?: Employee | null;
  onSubmit: (values: EmployeeFormValues) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting: boolean;
};

const statusOptions: EmployeeStatus[] = ['active', 'inactive', 'terminated'];
const taxStatusOptions: TaxStatus[] = ['registered', 'withholding', 'exempt', 'unknown'];

function createDefaultValues(): EmployeeFormValues {
  return {
    firstName: '',
    lastName: '',
    email: '',
    dni: '',
    status: 'active',
    taxStatus: 'registered',
    hiredAt: new Date().toISOString().slice(0, 10),
    rolesCsv: ''
  };
}

function toFormValues(employee?: Employee | null): EmployeeFormValues {
  if (!employee) {
    return createDefaultValues();
  }

  return {
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    dni: employee.dni,
    status: employee.status,
    taxStatus: employee.taxStatus,
    hiredAt: employee.hiredAt ? employee.hiredAt.slice(0, 10) : createDefaultValues().hiredAt,
    rolesCsv: employee.roles.join(', ')
  };
}

export function EmployeeForm({
  mode,
  initialEmployee,
  onSubmit,
  onCancel,
  isSubmitting
}: EmployeeFormProps) {
  const [values, setValues] = useState<EmployeeFormValues>(() => toFormValues(initialEmployee));

  const heading = mode === 'edit' ? 'Update employee' : 'Create new employee';
  const submitLabel = mode === 'edit' ? 'Save changes' : 'Create employee';

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          {mode === 'edit' ? 'Edit employee' : 'Add employee'}
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">{heading}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {mode === 'edit'
            ? 'Update profile data, employment status, or assigned roles.'
            : 'Fill in the employee details below and submit to add them to the roster.'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          First name
          <input
            type="text"
            name="firstName"
            value={values.firstName}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
            required
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Last name
          <input
            type="text"
            name="lastName"
            value={values.lastName}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
            required
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
            required
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          DNI
          <input
            type="text"
            name="dni"
            value={values.dni}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
            required
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Employment status
          <select
            name="status"
            value={values.status}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Tax status
          <select
            name="taxStatus"
            value={values.taxStatus}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
          >
            {taxStatusOptions.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Hire date
          <input
            type="date"
            name="hiredAt"
            value={values.hiredAt}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
          />
        </label>
        {mode === 'edit' && (
          <label className="text-sm font-medium text-slate-700">
            Roles (comma separated)
            <input
              type="text"
              name="rolesCsv"
              value={values.rolesCsv}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
              placeholder="E.g. Driver, Supervisor"
            />
          </label>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
        {mode === 'edit' && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-slate-500 transition hover:text-slate-700"
          >
            Cancel edit
          </button>
        )}
      </div>
    </form>
  );
}
