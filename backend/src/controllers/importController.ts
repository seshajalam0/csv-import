import type { RequestHandler } from "express";
import { parseCsvBuffer } from "../services/csv/parser.js";
import { processCsvRows } from "../services/importProcessor.js";
import { BadRequestError } from "../utils/errors.js";

const getUploadedBuffer = (file: Express.Multer.File | undefined) => {
  if (!file?.buffer?.length) {
    throw new BadRequestError("CSV file is required.");
  }

  return file.buffer;
};

export const handleUploadPreview: RequestHandler = async (request, response, next) => {
  try {
    const parsed = await parseCsvBuffer(getUploadedBuffer(request.file));

    response.json({
      columns: parsed.columns,
      rowCount: parsed.rows.length,
      previewRows: parsed.rows.slice(0, 20)
    });
  } catch (error) {
    next(error);
  }
};

export const handleProcessCsv: RequestHandler = async (request, response, next) => {
  try {
    const startedAt = Date.now();
    const parsed = await parseCsvBuffer(getUploadedBuffer(request.file));
    const result = await processCsvRows(parsed.rows);

    response.json({
      ...result,
      columns: parsed.columns,
      stats: {
        ...result.stats,
        rowCount: parsed.rows.length,
        processingTimeMs: Date.now() - startedAt
      }
    });
  } catch (error) {
    next(error);
  }
};
