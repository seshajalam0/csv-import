"use client";

import { RefreshCw, Send, ShieldCheck } from "lucide-react";
import { startTransition, useState } from "react";
import { processCsvFile } from "@/lib/api";
import { parseCsvPreview } from "@/lib/csv";
import type { ImportResult, LocalCsvPreview } from "@/types/importer";
import { FileDropzone } from "./FileDropzone";
import { PreviewTable } from "./PreviewTable";
import { ResultDashboard } from "./ResultDashboard";

export function CsvImporter() {
  const [preview, setPreview] = useState<LocalCsvPreview | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string>();
  const [isParsing, setIsParsing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = async (file: File) => {
    setError(undefined);
    setResult(null);
    setIsParsing(true);

    try {
      const parsed = await parseCsvPreview(file);
      startTransition(() => {
        setPreview(parsed);
      });
    } catch (nextError) {
      setPreview(null);
      setError(nextError instanceof Error ? nextError.message : "Unable to parse CSV.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleProcess = async () => {
    if (!preview) {
      return;
    }

    setError(undefined);
    setIsProcessing(true);

    try {
      const nextResult = await processCsvFile(preview.file);
      setResult(nextResult);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Import failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearState = () => {
    setPreview(null);
    setResult(null);
    setError(undefined);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
      <div className="grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-4">
          <FileDropzone
            file={preview?.file}
            disabled={isParsing || isProcessing}
            error={error}
            onFile={handleFile}
            onClear={clearState}
          />

          <section className="rounded-lg border border-line bg-[var(--surface)] p-4 shadow-panel">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-moss" />
              Import rules
            </div>
            <div className="space-y-2 text-sm text-muted">
              <p>Rows need at least one email or phone to import.</p>
              <p>Extra contacts are preserved in CRM notes.</p>
              <p>Gemini is used when the backend has an API key; otherwise the local mapper runs.</p>
            </div>
          </section>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleProcess}
              disabled={!preview || isProcessing || isParsing}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-moss px-4 text-sm font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isProcessing ? "Processing" : "Confirm Import"}
            </button>
            <button
              type="button"
              onClick={clearState}
              disabled={isProcessing}
              className="h-11 rounded-md border border-line bg-[var(--surface)] px-4 text-sm font-semibold text-muted transition hover:bg-field hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="space-y-5">
          {preview ? (
            <PreviewTable columns={preview.columns} rows={preview.rows} rowCount={preview.rowCount} />
          ) : (
            <section className="grid min-h-[430px] place-items-center rounded-lg border border-line bg-[var(--surface)] shadow-panel">
              <div className="max-w-md px-6 text-center">
                <p className="text-lg font-semibold">Waiting for CSV</p>
                <p className="mt-2 text-sm text-muted">
                  Upload a spreadsheet to inspect columns, sample rows, and import readiness.
                </p>
              </div>
            </section>
          )}

          {result ? <ResultDashboard result={result} /> : null}
        </div>
      </div>
    </main>
  );
}
