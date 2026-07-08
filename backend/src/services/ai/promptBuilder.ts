import { crmDataSources, crmStatuses } from "../../types/crm.js";
import type { CsvRow } from "../csv/parser.js";

export interface PromptRow {
  original_row_index: number;
  values: CsvRow;
}

export const buildImportPrompt = (rows: PromptRow[]) => {
  return [
    "You map arbitrary CSV rows into the GrowEasy CRM lead schema.",
    "Return JSON only. Do not wrap the response in markdown.",
    "Never invent values. Use null or omit fields when the CSV does not provide a value.",
    "Skip rows that do not contain at least one valid email or phone number.",
    `Allowed status values: ${crmStatuses.join(", ")}. Use "new" unless the CSV clearly says otherwise.`,
    `Allowed data_source values: ${crmDataSources.join(", ")}. Use "csv_import" unless a source is clear.`,
    "Put useful unmapped context, extra emails, and extra phones into crm_note.",
    "confidence is optional and must be between 0 and 1.",
    "Response shape:",
    JSON.stringify({
      records: [
        {
          original_row_index: 0,
          first_name: "Ada",
          last_name: "Lovelace",
          full_name: "Ada Lovelace",
          email: "ada@example.com",
          phone: "+15551234567",
          company: "Example Inc",
          job_title: "Founder",
          city: "London",
          state: "",
          country: "United Kingdom",
          address: "",
          status: "new",
          data_source: "csv_import",
          crm_note: "",
          confidence: 0.86
        }
      ],
      skipped: [
        {
          original_row_index: 1,
          reason: "Missing email and phone"
        }
      ]
    }),
    "CSV rows:",
    JSON.stringify(rows)
  ].join("\n");
};
