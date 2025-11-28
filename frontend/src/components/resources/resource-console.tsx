'use client';

import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryKey, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  ResourceDefinition,
  resourceDefinitions
} from '@/components/resources/resource-config';

type ResourcePanelProps<T extends { id: string }> = {
  title: string;
  description: string;
  queryKey: QueryKey;
  listFn: () => Promise<T[]>;
  createFn: (payload: unknown) => Promise<unknown>;
  updateFn?: (id: string, payload: unknown) => Promise<unknown>;
  deleteFn: (id: string) => Promise<unknown>;
  createTemplate: string;
  updateTemplate?: string;
  renderItem: (item: T) => ReactNode;
};

const pretty = (value: unknown) => JSON.stringify(value, null, 2);

const resourceConfigs: Array<ResourcePanelProps<{ id: string }>> = resourceDefinitions.map(
  (definition) => ({
    title: definition.title,
    description: definition.description,
    queryKey: definition.queryKey,
    listFn: definition.listFn,
    createFn: definition.createFn,
    updateFn: definition.updateFn,
    deleteFn: definition.deleteFn,
    createTemplate: pretty(definition.createTemplate),
    updateTemplate: definition.updateTemplate ? pretty(definition.updateTemplate) : undefined,
    renderItem: definition.preview as ResourceDefinition<{ id: string }>['preview']
  })
);

export function ResourceConsole() {
  return (
    <section className="flex flex-col gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Control Center
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">
          CRUD sandbox for all resources
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Use the JSON-powered forms to quickly test create, update, and delete operations across the
          API without leaving the dashboard.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {resourceConfigs.map((config) => (
          <ResourcePanel key={config.title} {...config} />
        ))}
      </div>
    </section>
  );
}

function ResourcePanel<T extends { id: string }>({
  title,
  description,
  queryKey,
  listFn,
  createFn,
  updateFn,
  deleteFn,
  createTemplate,
  updateTemplate,
  renderItem
}: ResourcePanelProps<T>) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey,
    queryFn: listFn
  });

  const defaultCreate = useMemo(() => createTemplate, [createTemplate]);
  const defaultUpdate = useMemo(() => updateTemplate ?? '{ }', [updateTemplate]);

  const [createBody, setCreateBody] = useState(defaultCreate);
  const [updateBody, setUpdateBody] = useState(defaultUpdate);
  const [updateId, setUpdateId] = useState('');
  const [deleteId, setDeleteId] = useState('');

  const [createError, setCreateError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setCreateBody(defaultCreate);
  }, [defaultCreate]);

  useEffect(() => {
    setUpdateBody(defaultUpdate);
  }, [defaultUpdate]);

  const parsePayload = (raw: string): unknown => {
    if (!raw.trim()) {
      throw new Error('Payload cannot be empty JSON');
    }
    return JSON.parse(raw);
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError(null);
    setIsCreating(true);

    try {
      const payload = parsePayload(createBody);
      await createFn(payload);
      await queryClient.invalidateQueries({ queryKey });
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    if (!updateFn) return;
    event.preventDefault();
    setUpdateError(null);

    if (!updateId.trim()) {
      setUpdateError('Provide a resource ID to update.');
      return;
    }

    setIsUpdating(true);
    try {
      const payload = parsePayload(updateBody);
      await updateFn(updateId.trim(), payload);
      await queryClient.invalidateQueries({ queryKey });
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDeleteError(null);

    if (!deleteId.trim()) {
      setDeleteError('Provide a resource ID to delete.');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteFn(deleteId.trim());
      setDeleteId('');
      await queryClient.invalidateQueries({ queryKey });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Latest records
          </p>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            {isLoading ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : isError ? (
              <p className="text-sm text-rose-600">
                {error instanceof Error ? error.message : 'Failed to load data.'}
              </p>
            ) : data && data.length > 0 ? (
              <ul className="space-y-3">
                {data.slice(0, 4).map((item) => (
                  <li key={item.id}>{renderItem(item)}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No data yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <form onSubmit={handleCreate} className="rounded-xl border border-slate-100 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Create
              </p>
              <button
                type="submit"
                disabled={isCreating}
                className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-emerald-400"
              >
                {isCreating ? 'Saving…' : 'Create'}
              </button>
            </div>
            <textarea
              className="h-32 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-mono text-slate-800"
              value={createBody}
              onChange={(event) => setCreateBody(event.target.value)}
            />
            {createError && <p className="mt-1 text-xs text-rose-600">{createError}</p>}
          </form>

          {updateFn && (
            <form onSubmit={handleUpdate} className="rounded-xl border border-slate-100 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Update
                </p>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-indigo-400"
                >
                  {isUpdating ? 'Updating…' : 'Update'}
                </button>
              </div>
              <input
                type="text"
                placeholder="Resource ID"
                className="mb-2 w-full rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-800"
                value={updateId}
                onChange={(event) => setUpdateId(event.target.value)}
              />
              <textarea
                className="h-24 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-mono text-slate-800"
                value={updateBody}
                onChange={(event) => setUpdateBody(event.target.value)}
              />
              {updateError && <p className="mt-1 text-xs text-rose-600">{updateError}</p>}
            </form>
          )}

          <form onSubmit={handleDelete} className="rounded-xl border border-slate-100 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Delete
              </p>
              <button
                type="submit"
                disabled={isDeleting}
                className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-rose-400"
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
            <input
              type="text"
              placeholder="Resource ID"
              className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-800"
              value={deleteId}
              onChange={(event) => setDeleteId(event.target.value)}
            />
            {deleteError && <p className="mt-1 text-xs text-rose-600">{deleteError}</p>}
          </form>
        </div>
      </div>
    </article>
  );
}
