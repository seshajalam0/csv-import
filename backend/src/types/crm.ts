export const crmStatuses = ["new", "contacted", "qualified", "lost", "customer"] as const;
export const crmDataSources = [
  "csv_import",
  "website",
  "referral",
  "event",
  "email",
  "phone",
  "social",
  "other"
] as const;

export type CrmStatus = (typeof crmStatuses)[number];
export type CrmDataSource = (typeof crmDataSources)[number];

export interface CrmRecord {
  original_row_index: number;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  status: CrmStatus;
  data_source: CrmDataSource;
  crm_note?: string;
  confidence?: number;
}

export interface SkippedRecord {
  original_row_index: number;
  reason: string;
  raw?: Record<string, string>;
}

export interface ImportStats {
  rowCount: number;
  importedCount: number;
  skippedCount: number;
  aiCalls: number;
  processingTimeMs: number;
  usedHeuristicFallback: boolean;
}

export interface ImportResult {
  importedRecords: CrmRecord[];
  skippedRecords: SkippedRecord[];
  stats: ImportStats;
}
