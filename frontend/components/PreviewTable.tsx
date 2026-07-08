"use client";

import type { CsvRow } from "@/types/importer";

interface PreviewTableProps {
  columns: string[];
  rows: CsvRow[];
  rowCount: number;
}

export function PreviewTable({ columns, rows, rowCount }: PreviewTableProps) {
  return (
    <section className="rounded-lg border border-line bg-[var(--surface)] shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="text-base font-semibold">CSV Preview</h2>
          <p className="text-sm text-muted">
            {rowCount.toLocaleString()} rows, {columns.length.toLocaleString()} columns
          </p>
        </div>
        <span className="rounded-md border border-line bg-field px-2.5 py-1 text-xs font-semibold text-muted">
          Showing first {rows.length.toLocaleString()}
        </span>
      </div>

      <div className="max-h-[520px] overflow-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="sticky top-0 z-10 border-b border-line bg-field px-3 py-2 text-xs font-semibold uppercase text-muted"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="odd:bg-white even:bg-field/55">
                {columns.map((column) => (
                  <td key={column} className="max-w-64 border-b border-line/70 px-3 py-2 align-top text-ink">
                    <span className="line-clamp-2 break-words">{row[column]}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
