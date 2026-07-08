import dotenv from "dotenv";

dotenv.config();

const optionalNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  port: optionalNumber(process.env.PORT, 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  batchSize: optionalNumber(process.env.BATCH_SIZE, 35),
  maxFileSizeMb: optionalNumber(process.env.MAX_FILE_SIZE_MB, 25)
};
