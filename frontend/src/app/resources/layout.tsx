import Link from 'next/link';
import { ReactNode } from 'react';

import { resourceDefinitions } from '@/components/resources/resource-config';

export default function ResourcesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
        <header className="border-b border-slate-200 pb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Operations · Resources
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Resource workspace</h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage every API entity with a consistent CRUD surface.
              </p>
            </div>
            <Link
              href="/"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              ← Back to dashboard
            </Link>
          </div>

          <nav className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/resources"
              className="rounded-full border border-slate-200 px-4 py-1 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              Overview
            </Link>
            {resourceDefinitions.map((resource) => (
              <Link
                key={resource.slug}
                href={`/resources/${resource.slug}`}
                className="rounded-full border border-slate-200 px-4 py-1 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                {resource.title}
              </Link>
            ))}
          </nav>
        </header>

        <div>{children}</div>
      </div>
    </div>
  );
}
