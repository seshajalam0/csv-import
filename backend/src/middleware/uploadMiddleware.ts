import multer from "multer";
import { env } from "../config/env.js";
import { BadRequestError } from "../utils/errors.js";

const csvMimeTypes = new Set([
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
  "text/plain"
]);

export const uploadCsv = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024,
    files: 1
  },
  fileFilter: (_request, file, callback) => {
    const hasCsvName = file.originalname.toLowerCase().endsWith(".csv");
    if (!hasCsvName && !csvMimeTypes.has(file.mimetype)) {
      callback(new BadRequestError("Upload a CSV file."));
      return;
    }

    callback(null, true);
  }
});
