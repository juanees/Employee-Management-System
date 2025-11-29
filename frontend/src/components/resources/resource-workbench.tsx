'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

import {
  getResourceDefinition,
  ResourceDefinition,
  ResourceSlug
} from '@/components/resources/resource-config';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notFound } from 'next/navigation';

type ResourceWorkbenchProps = {
  slug: ResourceSlug;
};

type Identifiable = { id: string };

const pretty = (value: unknown) => JSON.stringify(value, null, 2);

export function ResourceWorkbench({ slug }: ResourceWorkbenchProps) {
  const definition = getResourceDefinition(slug) as ResourceDefinition<Identifiable> | undefined;

  if (!definition) {
    notFound();
  }

  const queryClient = useQueryClient();
  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt
  } = useQuery({
    queryKey: definition.queryKey,
    queryFn: definition.listFn
  });

  const createTemplate = useMemo(() => pretty(definition.createTemplate), [definition.createTemplate]);
  const updateTemplate = useMemo(
    () => pretty(definition.updateTemplate ?? {}),
    [definition.updateTemplate]
  );

  const [createBody, setCreateBody] = useState(createTemplate);
  const [updateBody, setUpdateBody] = useState(updateTemplate);
  const [updateId, setUpdateId] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [createError, setCreateError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setCreateBody(createTemplate);
  }, [createTemplate]);

  useEffect(() => {
    setUpdateBody(updateTemplate);
  }, [updateTemplate]);

  useEffect(() => {
    if (data.length === 0) {
      setSelectedId(null);
      return;
    }
    setSelectedId((current) => current ?? data[0].id);
  }, [data]);

  const selectedRecord = data.find((item) => item.id === selectedId) ?? null;

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
      await definition.createFn(payload);
      await queryClient.invalidateQueries({ queryKey: definition.queryKey });
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!definition.updateFn) return;
    setUpdateError(null);

    if (!updateId.trim()) {
      setUpdateError('Provide a resource ID to update.');
      return;
    }

    setIsUpdating(true);
    try {
      const payload = parsePayload(updateBody);
      await definition.updateFn(updateId.trim(), payload);
      await queryClient.invalidateQueries({ queryKey: definition.queryKey });
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
      await definition.deleteFn(deleteId.trim());
      setDeleteId('');
      await queryClient.invalidateQueries({ queryKey: definition.queryKey });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setUpdateId(id);
    setDeleteId(id);
  };

  const lastUpdatedLabel = dataUpdatedAt
    ? new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit'
      }).format(new Date(dataUpdatedAt))
    : '—';

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Grid</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">{definition.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{definition.description}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Records</p>
          <p className="text-3xl font-semibold text-slate-900">{data.length}</p>
          <p className="text-xs text-slate-500">Last updated {lastUpdatedLabel}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Grid</p>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isFetching ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  {definition.columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500 ${
                        column.align === 'right'
                          ? 'text-right'
                          : column.align === 'center'
                            ? 'text-center'
                            : 'text-left'
                      } ${column.className ?? ''}`}
                    >
                      {column.header}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={definition.columns.length + 1} className="px-4 py-6 text-center text-slate-500">
                      Loading records…
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={definition.columns.length + 1} className="px-4 py-6 text-center text-rose-600">
                      {error instanceof Error ? error.message : 'Failed to load data.'}
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={definition.columns.length + 1} className="px-4 py-6 text-center text-slate-500">
                      No data yet. Try creating a new {definition.entityName.toLowerCase()}.
                    </td>
                  </tr>
                ) : (
                  data.map((item) => {
                    const isSelected = item.id === selectedId;
                    return (
                      <tr
                        key={item.id}
                        className={`cursor-pointer transition hover:bg-slate-50 ${
                          isSelected ? 'bg-slate-50' : ''
                        }`}
                        onClick={() => handleSelect(item.id)}
                      >
                        {definition.columns.map((column) => (
                          <td
                            key={column.key}
                            className={`px-4 py-3 ${
                              column.align === 'right'
                                ? 'text-right'
                                : column.align === 'center'
                                  ? 'text-center'
                                  : 'text-left'
                            }`}
                          >
                            {column.render(item)}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleSelect(item.id);
                            }}
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">View</p>
              {selectedRecord && (
                <span className="text-xs text-slate-500">ID {selectedRecord.id.slice(0, 8)}…</span>
              )}
            </div>
            {selectedRecord ? (
              <dl className="space-y-3 text-sm">
                {definition.detailFields.map((field) => (
                  <div key={field.key} className="flex flex-col gap-1 rounded-xl bg-slate-50 px-3 py-2">
                    <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                      {field.label}
                    </dt>
                    <dd className="text-slate-800">{field.render(selectedRecord)}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-slate-500">Select a record from the grid to see details.</p>
            )}
          </article>

          <form onSubmit={handleCreate} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Create</p>
              <button
                type="submit"
                disabled={isCreating}
                className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-emerald-400"
              >
                {isCreating ? 'Saving…' : 'Create'}
              </button>
            </div>
            <textarea
              className="h-28 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono text-slate-800"
              value={createBody}
              onChange={(event) => setCreateBody(event.target.value)}
            />
            {createError && <p className="mt-1 text-xs text-rose-600">{createError}</p>}
          </form>

          {definition.updateFn && (
            <form onSubmit={handleUpdate} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Update</p>
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
                placeholder={`${definition.entityName} ID`}
                className="mb-2 w-full rounded-xl border border-slate-200 px-2 py-1 text-xs text-slate-800"
                value={updateId}
                onChange={(event) => setUpdateId(event.target.value)}
              />
              <textarea
                className="h-24 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono text-slate-800"
                value={updateBody}
                onChange={(event) => setUpdateBody(event.target.value)}
              />
              {updateError && <p className="mt-1 text-xs text-rose-600">{updateError}</p>}
            </form>
          )}

          <form onSubmit={handleDelete} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Delete</p>
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
              placeholder={`${definition.entityName} ID`}
              className="w-full rounded-xl border border-slate-200 px-2 py-1 text-xs text-slate-800"
              value={deleteId}
              onChange={(event) => setDeleteId(event.target.value)}
            />
            {deleteError && <p className="mt-1 text-xs text-rose-600">{deleteError}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
