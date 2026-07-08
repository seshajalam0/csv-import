"use client";

import { AlertTriangle, CheckCircle2, Clock3, Database, Phone, Search } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import type { CrmRecord, ImportResult, SkippedRecord } from "@/types/importer";

interface ResultDashboardProps {
  result: ImportResult;
}

type ResultTab = "imported" | "skipped";

const metricClass = "rounded-lg border border-line bg-[var(--surface)] px-4 py-3 shadow-panel";

const getDisplayName = (record: CrmRecord) => {
  return record.full_name || [record.first_name, record.last_name].filter(Boolean).join(" ") || "Unnamed lead";
};

export function ResultDashboard({ result }: ResultDashboardProps) {
  const [tab, setTab] = useState<ResultTab>("imported");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const filteredImported = useMemo(() => {
    if (!deferredQuery) {
      return result.importedRecords;
    }

    return result.importedRecords.filter((record) =>
      [getDisplayName(record), record.email, record.phone, record.company, record.city, record.crm_note]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(deferredQuery)
    );
  }, [deferredQuery, result.importedRecords]);

  const filteredSkipped = useMemo(() => {
    if (!deferredQuery) {
      return result.skippedRecords;
    }

    return result.skippedRecords.filter((record) =>
      [record.reason, JSON.stringify(record.raw ?? {})].join(" ").toLowerCase().includes(deferredQuery)
    );
  }, [deferredQuery, result.skippedRecords]);

  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <Metric
          icon={<Database className="h-4 w-4" />}
          label="Rows"
          value={result.stats.rowCount.toLocaleString()}
        />
        <Metric
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Imported"
          value={result.stats.importedCount.toLocaleString()}
        />
        <Metric
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Skipped"
          value={result.stats.skippedCount.toLocaleString()}
        />
        <Metric
          icon={<Clock3 className="h-4 w-4" />}
          label="Time"
          value={`${(result.stats.processingTimeMs / 1000).toFixed(1)}s`}
        />
      </div>

      <div className="rounded-lg border border-line bg-[var(--surface)] shadow-panel">
        <div className="flex flex-col gap-3 border-b border-line px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex rounded-md border border-line bg-field p-1">
            <button
              type="button"
              onClick={() => setTab("imported")}
              className={`rounded px-3 py-1.5 text-sm font-semibold ${
                tab === "imported" ? "bg-white text-ink shadow-sm" : "text-muted"
              }`}
            >
              Imported
            </button>
            <button
              type="button"
              onClick={() => setTab("skipped")}
              className={`rounded px-3 py-1.5 text-sm font-semibold ${
                tab === "skipped" ? "bg-white text-ink shadow-sm" : "text-muted"
              }`}
            >
              Skipped
            </button>
          </div>

          <label className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 w-full rounded-md border border-line bg-white pl-9 pr-3 text-sm outline-none transition focus:border-moss"
              placeholder="Search results"
            />
          </label>
        </div>

        {tab === "imported" ? <ImportedTable records={filteredImported} /> : <SkippedTable records={filteredSkipped} />}
      </div>
    </section>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className={metricClass}>
      <div className="mb-2 flex items-center gap-2 text-muted">
        {icon}
        <span className="text-xs font-semibold uppercase">{label}</span>
      </div>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

function ImportedTable({ records }: { records: CrmRecord[] }) {
  return (
    <div className="max-h-[560px] overflow-auto">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr>
            {["Lead", "Contact", "Company", "Status", "Confidence", "Note"].map((heading) => (
              <th
                key={heading}
                className="sticky top-0 z-10 border-b border-line bg-field px-3 py-2 text-xs font-semibold uppercase text-muted"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.original_row_index} className="odd:bg-white even:bg-field/55">
              <td className="border-b border-line/70 px-3 py-3 align-top">
                <p className="font-semibold">{getDisplayName(record)}</p>
                <p className="text-xs text-muted">Row {record.original_row_index + 1}</p>
              </td>
              <td className="border-b border-line/70 px-3 py-3 align-top">
                <p>{record.email || "No email"}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                  <Phone className="h-3 w-3" />
                  {record.phone || "No phone"}
                </p>
              </td>
              <td className="border-b border-line/70 px-3 py-3 align-top">
                <p>{record.company || "Unknown"}</p>
                <p className="text-xs text-muted">{record.job_title || record.city || ""}</p>
              </td>
              <td className="border-b border-line/70 px-3 py-3 align-top">
                <span className="rounded-md bg-mint px-2 py-1 text-xs font-semibold text-moss">{record.status}</span>
              </td>
              <td className="border-b border-line/70 px-3 py-3 align-top">
                {record.confidence ? `${Math.round(record.confidence * 100)}%` : "N/A"}
              </td>
              <td className="max-w-72 border-b border-line/70 px-3 py-3 align-top text-muted">
                <span className="line-clamp-3">{record.crm_note || ""}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SkippedTable({ records }: { records: SkippedRecord[] }) {
  return (
    <div className="max-h-[560px] overflow-auto">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr>
            {["Row", "Reason", "Raw data"].map((heading) => (
              <th
                key={heading}
                className="sticky top-0 z-10 border-b border-line bg-field px-3 py-2 text-xs font-semibold uppercase text-muted"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={`${record.original_row_index}-${record.reason}`} className="odd:bg-white even:bg-field/55">
              <td className="border-b border-line/70 px-3 py-3 align-top font-semibold">
                {record.original_row_index + 1}
              </td>
              <td className="border-b border-line/70 px-3 py-3 align-top text-rust">{record.reason}</td>
              <td className="max-w-3xl border-b border-line/70 px-3 py-3 align-top text-muted">
                <span className="line-clamp-3 break-words">{JSON.stringify(record.raw ?? {})}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
