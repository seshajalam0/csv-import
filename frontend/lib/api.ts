import type { ImportResult } from "@/types/importer";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const processCsvFile = async (file: File): Promise<ImportResult> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/process`, {
    method: "POST",
    body: formData
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? "CSV processing failed.");
  }

  return payload as ImportResult;
};
