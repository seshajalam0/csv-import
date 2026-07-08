import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../../config/env.js";
import type { CrmRecord, SkippedRecord } from "../../types/crm.js";
import { buildImportPrompt, type PromptRow } from "./promptBuilder.js";
import { parseJsonFromModel } from "./json.js";

export interface AiMappingResult {
  records: CrmRecord[];
  skipped: SkippedRecord[];
  aiCalls: number;
}

interface ModelResponseShape {
  records?: CrmRecord[];
  skipped?: SkippedRecord[];
}

export const mapRowsWithGemini = async (rows: PromptRow[], feedback?: string): Promise<AiMappingResult> => {
  if (!env.geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const client = new GoogleGenerativeAI(env.geminiApiKey);
  const model = client.getGenerativeModel({
    model: env.geminiModel,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1
    }
  });

  const prompt = feedback
    ? `${buildImportPrompt(rows)}\nPrevious validation problem: ${feedback}\nFix the JSON and preserve original_row_index values.`
    : buildImportPrompt(rows);

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = parseJsonFromModel(text) as ModelResponseShape;

  return {
    records: Array.isArray(parsed.records) ? parsed.records : [],
    skipped: Array.isArray(parsed.skipped) ? parsed.skipped : [],
    aiCalls: 1
  };
};
