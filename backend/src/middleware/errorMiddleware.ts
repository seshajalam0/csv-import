import type { ErrorRequestHandler } from "express";
import multer from "multer";
import { AppError } from "../utils/errors.js";

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: error.message
    });
    return;
  }

  if (error instanceof multer.MulterError) {
    response.status(400).json({
      error: error.code === "LIMIT_FILE_SIZE" ? "CSV file is too large." : error.message
    });
    return;
  }

  console.error(error);
  response.status(500).json({
    error: "Unexpected server error."
  });
};
