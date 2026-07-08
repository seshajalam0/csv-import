import csv from "csv-parser";
import { Readable } from "node:stream";
import { BadRequestError } from "../../utils/errors.js";

export type CsvRow = Record<string, string>;

export interface ParsedCsv {
  columns: string[];
  rows: CsvRow[];
}

const normalizeCell = (value: unknown) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

export const parseCsvBuffer = async (buffer: Buffer): Promise<ParsedCsv> => {
  const rows: CsvRow[] = [];
  const columns = new Set<string>();

  await new Promise<void>((resolve, reject) => {
    Readable.from(buffer)
      .pipe(
        csv({
          mapHeaders: ({ header }) => header.trim(),
          mapValues: ({ value }) => normalizeCell(value),
          strict: false,
          skipLines: 0
        })
      )
      .on("headers", (headers: string[]) => {
        headers.filter(Boolean).forEach((header) => columns.add(header));
      })
      .on("data", (row: CsvRow) => {
        const normalizedRow: CsvRow = {};

        for (const [key, value] of Object.entries(row)) {
          const normalizedKey = key.trim();
          if (!normalizedKey) {
            continue;
          }

          normalizedRow[normalizedKey] = normalizeCell(value);
          columns.add(normalizedKey);
        }

        const hasContent = Object.values(normalizedRow).some((value) => value.length > 0);
        if (hasContent) {
          rows.push(normalizedRow);
        }
      })
      .on("error", reject)
      .on("end", resolve);
  });

  if (!columns.size) {
    throw new BadRequestError("CSV header row is missing.");
  }

  return {
    columns: Array.from(columns),
    rows
  };
};
