"use client";

import clsx from "clsx";
import { FileSpreadsheet, UploadCloud, X } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { formatFileSize } from "@/lib/csv";

interface FileDropzoneProps {
  file?: File;
  disabled?: boolean;
  error?: string;
  onFile: (file: File) => void;
  onClear: () => void;
}

export function FileDropzone({ file, disabled, error, onFile, onClear }: FileDropzoneProps) {
  const onDrop = useCallback(
    (files: File[]) => {
      const [nextFile] = files;
      if (nextFile) {
        onFile(nextFile);
      }
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"]
    }
  });

  return (
    <section className="rounded-lg border border-line bg-[var(--surface)] shadow-panel">
      <div className="border-b border-line px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-mint text-moss">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-normal">GrowEasy CSV Importer</h1>
            <p className="text-sm text-muted">Map spreadsheet leads into CRM-ready records.</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div
          {...getRootProps()}
          className={clsx(
            "min-h-52 cursor-pointer rounded-lg border border-dashed p-6 transition",
            "flex flex-col items-center justify-center text-center",
            isDragActive ? "border-moss bg-mint/60" : "border-line bg-field",
            disabled && "cursor-not-allowed opacity-70"
          )}
        >
          <input {...getInputProps()} />
          <UploadCloud className="mb-4 h-9 w-9 text-moss" />
          <p className="text-base font-semibold">Drop a CSV file here</p>
          <p className="mt-1 max-w-sm text-sm text-muted">or choose a file to preview before importing.</p>
        </div>

        {file ? (
          <div className="mt-4 flex items-center justify-between rounded-md border border-line bg-white px-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{file.name}</p>
              <p className="text-xs text-muted">{formatFileSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={onClear}
              className="grid h-9 w-9 place-items-center rounded-md border border-line text-muted transition hover:bg-field hover:text-ink"
              aria-label="Clear file"
              title="Clear file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-md border border-rust/30 bg-rust/10 px-3 py-2 text-sm text-rust">
            {error}
          </div>
        ) : null}
      </div>
    </section>
  );
}
