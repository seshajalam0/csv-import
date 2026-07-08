import cors from "cors";
import express from "express";
import { importRoutes } from "./routes/importRoutes.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import { env } from "./config/env.js";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true
    })
  );
  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_request, response) => {
    response.json({
      ok: true,
      service: "groweasy-ai-csv-importer",
      aiEnabled: Boolean(env.geminiApiKey)
    });
  });

  app.use(importRoutes);
  app.use(errorMiddleware);

  return app;
};
