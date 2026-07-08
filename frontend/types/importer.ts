export type CsvRow = Record<string, string>;

export interface LocalCsvPreview {
  file: File;
  columns: string[];
  rows: CsvRow[];
  rowCount: number;
}

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
  status: string;
  data_source: string;
  crm_note?: string;
  confidence?: number;
}

export interface SkippedRecord {
  original_row_index: number;
  reason: string;
  raw?: CsvRow;
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
  columns: string[];
  importedRecords: CrmRecord[];
  skippedRecords: SkippedRecord[];
  stats: ImportStats;
}
