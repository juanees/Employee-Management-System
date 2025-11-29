'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

import { ResourceModal } from '@/components/resources/resource-modal';
import { ResourceDefinition, resourceDefinitions } from '@/components/resources/resource-config';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notFound } from 'next/navigation';

type ResourceWorkbenchProps = {
  slug: string;
};

type Identifiable = { id: string };
type ModalType = 'create' | 'update' | 'view' | 'delete' | null;

const pretty = (value: unknown) => JSON.stringify(value, null, 2);

export function ResourceWorkbench({ slug }: ResourceWorkbenchProps) {
  const definition = resourceDefinitions.find((resource) => resource.slug === slug) as
    | ResourceDefinition<Identifiable>
    | undefined;

  if (!definition) {
    notFound();
  }

  return <ResourceWorkbenchInner definition={definition} />;
}

type ResourceWorkbenchInnerProps = {
  definition: ResourceDefinition<Identifiable>;
};

function ResourceWorkbenchInner({ definition }: ResourceWorkbenchInnerProps) {
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

  const [createError, setCreateError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalRecord, setModalRecord] = useState<Identifiable | null>(null);

  useEffect(() => {
    setCreateBody(createTemplate);
  }, [createTemplate]);

  useEffect(() => {
    setUpdateBody(updateTemplate);
  }, [updateTemplate]);

  const parsePayload = (raw: string): unknown => {
    if (!raw.trim()) {
      throw new Error('Payload cannot be empty JSON');
    }
    return JSON.parse(raw);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalRecord(null);
  };

  const openCreateModal = () => {
    setCreateError(null);
    setActiveModal('create');
  };

  const openViewModal = (record: Identifiable) => {
    setModalRecord(record);
    setActiveModal('view');
  };

  const openUpdateModal = (record: Identifiable) => {
    if (!definition.updateFn) return;
    setModalRecord(record);
    setUpdateId(record.id);
    setUpdateError(null);
    setActiveModal('update');
  };

  const openDeleteModal = (record: Identifiable) => {
    setModalRecord(record);
    setDeleteId(record.id);
    setDeleteError(null);
    setActiveModal('delete');
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError(null);
    setIsCreating(true);

    try {
      const payload = parsePayload(createBody);
      await definition.createFn(payload);
      await queryClient.invalidateQueries({ queryKey: definition.queryKey });
      closeModal();
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
      closeModal();
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
      closeModal();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsDeleting(false);
    }
  };

  const lastUpdatedLabel = dataUpdatedAt
    ? new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit'
      }).format(new Date(dataUpdatedAt))
    : '—';

  return (
    <>
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

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Records grid</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
              >
                {isFetching ? 'Refreshing…' : 'Refresh'}
              </button>
              <button
                type="button"
                onClick={openCreateModal}
                className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white hover:bg-slate-800"
              >
                Add {definition.entityName}
              </button>
            </div>
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
                  data.map((item) => (
                    <tr key={item.id} className="transition hover:bg-slate-50">
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
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openViewModal(item)}
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300"
                          >
                            View
                          </button>
                          {definition.updateFn && (
                            <button
                              type="button"
                              onClick={() => openUpdateModal(item)}
                              className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openDeleteModal(item)}
                            className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-500"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <ResourceModal
        open={activeModal === 'view'}
        onClose={closeModal}
        title={`View ${definition.entityName}`}
        description="Inspect the selected record’s field-level data."
      >
        {modalRecord ? (
          <dl className="space-y-3">
            {definition.detailFields.map((field) => (
              <div key={field.key} className="flex flex-col gap-1 rounded-xl bg-slate-50 px-3 py-2">
                <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">{field.label}</dt>
                <dd className="text-slate-800">{field.render(modalRecord)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-slate-500">Select a record to view its details.</p>
        )}
      </ResourceModal>

      <ResourceModal
        open={activeModal === 'create'}
        onClose={closeModal}
        title={`Add ${definition.entityName}`}
        description="Paste JSON payloads to create new records via the Fastify API."
      >
        <form onSubmit={handleCreate} className="space-y-3">
          <textarea
            className="h-40 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono text-slate-800"
            value={createBody}
            onChange={(event) => setCreateBody(event.target.value)}
          />
          {createError && <p className="text-xs text-rose-600">{createError}</p>}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="rounded-full bg-emerald-600 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:bg-emerald-400"
            >
              {isCreating ? 'Saving…' : 'Create'}
            </button>
          </div>
        </form>
      </ResourceModal>

      {definition.updateFn && (
        <ResourceModal
          open={activeModal === 'update'}
          onClose={closeModal}
          title={`Edit ${definition.entityName}`}
          description="Provide the record ID plus JSON body to update existing data."
        >
          <form onSubmit={handleUpdate} className="space-y-3">
            <input
              type="text"
              placeholder={`${definition.entityName} ID`}
              className="w-full rounded-xl border border-slate-200 px-3 py-1 text-xs text-slate-800"
              value={updateId}
              onChange={(event) => setUpdateId(event.target.value)}
            />
            <textarea
              className="h-40 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono text-slate-800"
              value={updateBody}
              onChange={(event) => setUpdateBody(event.target.value)}
            />
            {updateError && <p className="text-xs text-rose-600">{updateError}</p>}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:bg-indigo-400"
              >
                {isUpdating ? 'Updating…' : 'Save changes'}
              </button>
            </div>
          </form>
        </ResourceModal>
      )}

      <ResourceModal
        open={activeModal === 'delete'}
        onClose={closeModal}
        title={`Delete ${definition.entityName}`}
        description="Confirm this action to permanently remove the record."
      >
        <form onSubmit={handleDelete} className="space-y-3">
          {modalRecord && (
            <p className="text-sm text-slate-600">
              You are deleting <span className="font-semibold">{definition.entityName}</span> with ID{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">{modalRecord.id}</code>.
            </p>
          )}
          <input
            type="text"
            placeholder={`${definition.entityName} ID`}
            className="w-full rounded-xl border border-slate-200 px-3 py-1 text-xs text-slate-800"
            value={deleteId}
            onChange={(event) => setDeleteId(event.target.value)}
          />
          {deleteError && <p className="text-xs text-rose-600">{deleteError}</p>}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeleting}
              className="rounded-full bg-rose-600 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:bg-rose-400"
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </form>
      </ResourceModal>
    </>
  );
}
