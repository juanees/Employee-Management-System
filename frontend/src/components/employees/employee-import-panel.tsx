'use client';

import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import {
  downloadEmployeeImportTemplate,
  EmployeeImportResult
} from '@/features/employees/api';
import { useEmployeeImport } from '@/features/employees/hooks';

type EmployeeImportPanelProps = {
  onImportComplete?: () => Promise<unknown> | unknown;
};

export function EmployeeImportPanel({ onImportComplete }: EmployeeImportPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<EmployeeImportResult | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

  const importMutation = useEmployeeImport();

  const handleDownloadTemplate = async () => {
    setFeedback(null);
    setIsDownloadingTemplate(true);
    try {
      const blob = await downloadEmployeeImportTemplate();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'employee-import-template.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : 'Unable to download the CSV template right now.'
      );
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setResult(null);
    setFeedback(null);
  };

  const resetFileInput = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setFeedback('Choose a CSV file before importing.');
      return;
    }

    setFeedback(null);

    try {
      const importResult = await importMutation.mutateAsync(selectedFile);
      setResult(importResult);

      await onImportComplete?.();

      if (importResult.failedCount === 0) {
        resetFileInput();
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Import failed. Try again.');
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Bulk import
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">Upload employee CSV</h2>
          <p className="mt-1 text-sm text-slate-500">
            Download the template, fill one row per employee, and drag it back here. We validate and
            report every error with its CSV row number.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownloadTemplate}
          disabled={isDownloadingTemplate}
          className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          {isDownloadingTemplate ? 'Preparing template…' : 'Download template'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4 text-sm text-slate-600">
          <span className="text-sm font-semibold text-slate-700">Choose CSV file</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="text-sm text-slate-600"
          />
          <span className="text-xs text-slate-500">
            Columns: dni, firstName, lastName, email, taxStatus, status, hiredAt (YYYY-MM-DD).
          </span>
          {selectedFile && (
            <span className="text-xs font-medium text-slate-700">Selected: {selectedFile.name}</span>
          )}
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={importMutation.isPending}
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {importMutation.isPending ? 'Importing…' : 'Import employees'}
          </button>
          {feedback && <p className="text-sm text-rose-600">{feedback}</p>}
        </div>
      </form>

      {result && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">
            Imported {result.createdCount} of {result.totalRows} rows.
          </p>
          {result.failedCount > 0 ? (
            <>
              <p className="mt-1 text-sm text-slate-600">
                Fix the errors below and re-upload. Row numbers map directly to your CSV file.
              </p>
              <div className="mt-3 max-h-64 overflow-auto rounded-lg border border-slate-200 bg-white">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Row</th>
                      <th className="px-4 py-2 font-semibold">Field</th>
                      <th className="px-4 py-2 font-semibold">Issue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.errors.map((error) => (
                      <tr key={`${error.rowNumber}-${error.field}-${error.message}`}>
                        <td className="px-4 py-2 font-semibold text-slate-900">Row {error.rowNumber}</td>
                        <td className="px-4 py-2 text-slate-600">{error.field}</td>
                        <td className="px-4 py-2 text-slate-600">{error.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="mt-1 text-sm text-emerald-600">All rows imported successfully.</p>
          )}
        </div>
      )}
    </section>
  );
}
