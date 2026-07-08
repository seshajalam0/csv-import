import { env } from "../config/env.js";
import type { CrmRecord, ImportResult, SkippedRecord } from "../types/crm.js";
import { crmRecordSchema, skippedRecordSchema } from "../validators/crmRecord.js";
import { chunkArray } from "./csv/chunker.js";
import type { CsvRow } from "./csv/parser.js";
import { mapRowsHeuristically } from "./ai/heuristicMapper.js";
import { mapRowsWithGemini } from "./ai/geminiClient.js";
import type { PromptRow } from "./ai/promptBuilder.js";
import { normalizeCrmRecord } from "./normalization.js";

interface BatchValidationResult {
  records: CrmRecord[];
  skipped: SkippedRecord[];
  errors: string[];
}

const validateBatch = (
  mappedRecords: CrmRecord[],
  mappedSkipped: SkippedRecord[],
  rawRowsByIndex: Map<number, CsvRow>
): BatchValidationResult => {
  const records: CrmRecord[] = [];
  const skipped: SkippedRecord[] = [];
  const errors: string[] = [];

  for (const mapped of mappedRecords) {
    const rawRow = rawRowsByIndex.get(Number(mapped.original_row_index));
    const normalized = normalizeCrmRecord(mapped, rawRow);
    const parsed = crmRecordSchema.safeParse(normalized);

    if (parsed.success) {
      records.push(parsed.data);
      continue;
    }

    const reason = parsed.error.issues.map((issue) => issue.message).join("; ");
    errors.push(`Row ${mapped.original_row_index}: ${reason}`);
    skipped.push({
      original_row_index: Number(mapped.original_row_index),
      reason,
      raw: rawRow
    });
  }

  for (const mapped of mappedSkipped) {
    const parsed = skippedRecordSchema.safeParse(mapped);
    if (parsed.success) {
      skipped.push({
        ...parsed.data,
        raw: rawRowsByIndex.get(parsed.data.original_row_index)
      });
      continue;
    }

    errors.push(`Skipped row payload invalid: ${parsed.error.message}`);
  }

  return {
    records,
    skipped,
    errors
  };
};

const mapBatch = async (rows: PromptRow[]) => {
  if (!env.geminiApiKey) {
    return {
      ...mapRowsHeuristically(rows),
      aiCalls: 0,
      usedHeuristicFallback: true
    };
  }

  try {
    const aiResult = await mapRowsWithGemini(rows);
    return {
      ...aiResult,
      usedHeuristicFallback: false
    };
  } catch (error) {
    const retryResult = await mapRowsHeuristically(rows);
    console.warn("Gemini mapping failed; using heuristic fallback.", error);

    return {
      ...retryResult,
      aiCalls: 1,
      usedHeuristicFallback: true
    };
  }
};

export const processCsvRows = async (rows: CsvRow[]): Promise<ImportResult> => {
  const promptRows: PromptRow[] = rows.map((row, index) => ({
    original_row_index: index,
    values: row
  }));
  const rawRowsByIndex = new Map(promptRows.map((row) => [row.original_row_index, row.values]));
  const chunks = chunkArray(promptRows, env.batchSize);
  const importedRecords: CrmRecord[] = [];
  const skippedRecords: SkippedRecord[] = [];
  let aiCalls = 0;
  let usedHeuristicFallback = false;

  for (const chunk of chunks) {
    const mapped = await mapBatch(chunk);
    aiCalls += mapped.aiCalls;
    usedHeuristicFallback = usedHeuristicFallback || mapped.usedHeuristicFallback;

    const validated = validateBatch(mapped.records, mapped.skipped, rawRowsByIndex);
    importedRecords.push(...validated.records);
    skippedRecords.push(...validated.skipped);

    const coveredIndexes = new Set([
      ...validated.records.map((record) => record.original_row_index),
      ...validated.skipped.map((record) => record.original_row_index)
    ]);

    for (const row of chunk) {
      if (!coveredIndexes.has(row.original_row_index)) {
        skippedRecords.push({
          original_row_index: row.original_row_index,
          reason: "Row was not returned by mapper.",
          raw: row.values
        });
      }
    }
  }

  return {
    importedRecords,
    skippedRecords,
    stats: {
      rowCount: rows.length,
      importedCount: importedRecords.length,
      skippedCount: skippedRecords.length,
      aiCalls,
      processingTimeMs: 0,
      usedHeuristicFallback
    }
  };
};
