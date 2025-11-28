import { Employee } from '@/features/employees/api';

type EmployeeTableProps = {
  employees: Employee[];
};

const statusTheme: Record<
  Employee['status'],
  { label: string; classes: string }
> = {
  active: { label: 'Active', classes: 'bg-emerald-100 text-emerald-700' },
  inactive: { label: 'Inactive', classes: 'bg-amber-100 text-amber-700' },
  terminated: { label: 'Terminated', classes: 'bg-rose-100 text-rose-700' }
};

const formatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
});

export function EmployeeTable({ employees }: EmployeeTableProps) {
  if (employees.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        No employees found. Seed the database to get started.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" className="px-6 py-4">
              Name
            </th>
            <th scope="col" className="px-6 py-4">
              Email
            </th>
            <th scope="col" className="px-6 py-4">
              Roles
            </th>
            <th scope="col" className="px-6 py-4">
              Tax Status
            </th>
            <th scope="col" className="px-6 py-4">
              Hired
            </th>
            <th scope="col" className="px-6 py-4 text-right">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
          {employees.map((employee) => (
            <tr key={employee.id} className="hover:bg-slate-50/60">
              <td className="px-6 py-4 font-medium">
                {employee.firstName} {employee.lastName}
              </td>
              <td className="px-6 py-4">{employee.email}</td>
              <td className="px-6 py-4 text-slate-500">
                {employee.roles.length > 0 ? employee.roles.join(', ') : '—'}
              </td>
              <td className="px-6 py-4 uppercase tracking-wide text-xs text-slate-500">
                {employee.taxStatus}
              </td>
              <td className="px-6 py-4">{formatter.format(new Date(employee.hiredAt))}</td>
              <td className="px-6 py-4 text-right">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTheme[employee.status].classes}`}>
                  {statusTheme[employee.status].label}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
