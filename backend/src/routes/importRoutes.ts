import { Router } from "express";
import { handleProcessCsv, handleUploadPreview } from "../controllers/importController.js";
import { uploadCsv } from "../middleware/uploadMiddleware.js";

export const importRoutes = Router();

importRoutes.post("/upload", uploadCsv.single("file"), handleUploadPreview);
importRoutes.post("/process", uploadCsv.single("file"), handleProcessCsv);
