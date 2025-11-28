import Link from 'next/link';

import { resourceDefinitions } from '@/components/resources/resource-config';

const operations = ['Grid', 'Create', 'Update', 'View', 'Delete'];

export default function ResourcesIndexPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-6 py-5 text-indigo-900">
        <h2 className="text-lg font-semibold">Full CRUD coverage</h2>
        <p className="mt-1 text-sm text-indigo-800">
          Every resource below ships with a live data grid plus create, update, view, and delete
          workflows wired straight into the Fastify API.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {resourceDefinitions.map((resource) => (
          <article
            key={resource.slug}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                {resource.entityName}
              </p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">{resource.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{resource.description}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {operations.map((op) => (
                <span
                  key={op}
                  className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-semibold uppercase text-slate-600"
                >
                  {op}
                </span>
              ))}
            </div>
            <div className="mt-5">
              <Link
                href={`/resources/${resource.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Open {resource.title}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
