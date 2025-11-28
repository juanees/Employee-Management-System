'use client';

import { EmployeeTable } from '@/components/employees/employee-table';
import { useEmployees } from '@/features/employees/hooks';

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit'
});

export default function Home() {
  const { data, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } = useEmployees();

  const summary = data?.reduce(
    (acc, employee) => {
      acc.total += 1;
      acc[employee.status] += 1;
      return acc;
    },
    { total: 0, active: 0, inactive: 0, terminated: 0 }
  ) ?? { total: 0, active: 0, inactive: 0, terminated: 0 };

  const lastUpdatedLabel = dataUpdatedAt ? timeFormatter.format(new Date(dataUpdatedAt)) : '—';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-5 border-b border-slate-200 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Operations
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Employee overview</h1>
            <p className="mt-1 text-sm text-slate-500">
              Live data pulled from the Fastify API using React Query.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isFetching ? 'Refreshing…' : 'Refresh data'}
            </button>
            <span className="text-xs text-slate-500">
              Last updated: <strong className="font-semibold text-slate-700">{lastUpdatedLabel}</strong>
            </span>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total employees" value={summary.total} accent="bg-indigo-100 text-indigo-700" />
          <StatCard label="Active" value={summary.active} accent="bg-emerald-100 text-emerald-700" />
          <StatCard label="Inactive" value={summary.inactive} accent="bg-amber-100 text-amber-700" />
          <StatCard label="Terminated" value={summary.terminated} accent="bg-rose-100 text-rose-700" />
        </section>

        {isError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error instanceof Error ? error.message : 'Something went wrong while loading employees.'}
          </div>
        )}

        {isLoading ? (
          <LoadingPlaceholder />
        ) : (
          <EmployeeTable employees={data ?? []} />
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
      <div className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-medium ${accent}`}>
        {value}
      </div>
    </article>
  );
}

function LoadingPlaceholder() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 h-5 w-32 animate-pulse rounded-full bg-slate-200" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-12 w-full animate-pulse rounded-full bg-slate-100" />
        ))}
      </div>
    </div>
  );
}
