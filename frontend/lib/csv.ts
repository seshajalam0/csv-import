import Papa from "papaparse";
import type { CsvRow, LocalCsvPreview } from "@/types/importer";

const MAX_PREVIEW_ROWS = 100;

export const parseCsvPreview = (file: File): Promise<LocalCsvPreview> => {
  return new Promise((resolve, reject) => {
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim(),
      complete: (result) => {
        const fields = result.meta.fields?.filter(Boolean) ?? [];

        if (!fields.length) {
          reject(new Error("CSV header row is missing."));
          return;
        }

        if (result.errors.length) {
          reject(new Error(result.errors[0]?.message ?? "CSV parsing failed."));
          return;
        }

        resolve({
          file,
          columns: fields,
          rows: result.data.slice(0, MAX_PREVIEW_ROWS),
          rowCount: result.data.length
        });
      },
      error: (error) => reject(error)
    });
  });
};

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};
