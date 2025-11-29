'use client';

import { useState } from 'react';
import { Employee } from '@/features/employees/api';
import {
  useCreateEmployee,
  useDeleteEmployee,
  useEmployees,
  useUpdateEmployee
} from '@/features/employees/hooks';
import { EmployeeForm, EmployeeFormValues } from '@/components/employees/employee-form';
import { EmployeeGrid } from '@/components/employees/employee-grid';

const rolesFromCsv = (rolesCsv: string) =>
  rolesCsv
    .split(',')
    .map((role) => role.trim())
    .filter(Boolean);

export default function EmployeesPage() {
  const { data: employees = [], isLoading, isError, error } = useEmployees();
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [feedback, setFeedback] = useState<{ variant: 'success' | 'error'; message: string } | null>(null);

  const mode: 'create' | 'edit' = selectedEmployee ? 'edit' : 'create';
  const formKey = selectedEmployee ? `edit-${selectedEmployee.id}` : 'create';

  const handleCreate = async (values: EmployeeFormValues) => {
    setFeedback(null);
    try {
      await createMutation.mutateAsync({
        dni: values.dni.trim(),
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        status: values.status,
        taxStatus: values.taxStatus,
        hiredAt: values.hiredAt ? new Date(values.hiredAt).toISOString() : undefined
      });
      setFeedback({ variant: 'success', message: 'Employee created successfully.' });
    } catch (mutationError) {
      setFeedback({
        variant: 'error',
        message:
          mutationError instanceof Error ? mutationError.message : 'Could not create the employee right now.'
      });
    }
  };

  const handleUpdate = async (values: EmployeeFormValues) => {
    if (!selectedEmployee) return;
    setFeedback(null);
    try {
      await updateMutation.mutateAsync({
        id: selectedEmployee.id,
        payload: {
          dni: values.dni.trim(),
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          status: values.status,
          taxStatus: values.taxStatus,
          hiredAt: values.hiredAt ? new Date(values.hiredAt).toISOString() : undefined,
          roles: rolesFromCsv(values.rolesCsv)
        }
      });
      setFeedback({ variant: 'success', message: 'Employee updated successfully.' });
      setSelectedEmployee(null);
    } catch (mutationError) {
      setFeedback({
        variant: 'error',
        message:
          mutationError instanceof Error ? mutationError.message : 'Could not update the employee right now.'
      });
    }
  };

  const handleDelete = async (employee: Employee) => {
    const confirmed = window.confirm(`Delete ${employee.firstName} ${employee.lastName}?`);
    if (!confirmed) {
      return;
    }

    setFeedback(null);
    try {
      await deleteMutation.mutateAsync(employee.id);
      setFeedback({ variant: 'success', message: 'Employee deleted.' });
      if (selectedEmployee?.id === employee.id) {
        setSelectedEmployee(null);
      }
    } catch (mutationError) {
      setFeedback({
        variant: 'error',
        message:
          mutationError instanceof Error ? mutationError.message : 'Could not delete the employee right now.'
      });
    }
  };

  const handleSubmit = async (values: EmployeeFormValues) => {
    if (mode === 'create') {
      await handleCreate(values);
    } else {
      await handleUpdate(values);
    }
  };

  const deletingEmployeeId = deleteMutation.isPending
    ? (deleteMutation.variables as string | undefined)
    : undefined;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-5 border-b border-slate-200 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Directory</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Employees</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage the employee roster, update statuses, and keep records in sync with the API.
            </p>
          </div>
        </header>

        {feedback && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              feedback.variant === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-rose-200 bg-rose-50 text-rose-800'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error instanceof Error ? error.message : 'Unable to load employees.'}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[360px,1fr]">
          <div>
            <EmployeeForm
              key={formKey}
              mode={mode}
              initialEmployee={selectedEmployee}
              onSubmit={handleSubmit}
              onCancel={() => setSelectedEmployee(null)}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
            />
          </div>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Employee grid</h2>
              <p className="text-sm text-slate-500">{employees.length} total</p>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-36 w-full animate-pulse rounded-2xl bg-white" />
                ))}
              </div>
            ) : (
              <EmployeeGrid
                employees={employees}
                onEdit={(employee) => {
                  setSelectedEmployee(employee);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onDelete={handleDelete}
                activeEmployeeId={selectedEmployee?.id}
                deletingEmployeeId={deletingEmployeeId}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
