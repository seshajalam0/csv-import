import type { CrmRecord, SkippedRecord } from "../../types/crm.js";
import { extractEmails, extractPhones } from "../normalization.js";
import type { PromptRow } from "./promptBuilder.js";

const fieldAliases: Record<keyof Omit<CrmRecord, "original_row_index" | "status" | "data_source">, string[]> = {
  first_name: ["first", "first name", "firstname", "given name"],
  last_name: ["last", "last name", "lastname", "surname", "family name"],
  full_name: ["name", "full name", "contact", "contact name", "lead name"],
  email: ["email", "email address", "mail", "e-mail"],
  phone: ["phone", "phone number", "mobile", "cell", "contact number", "telephone", "whatsapp"],
  company: ["company", "organization", "organisation", "account", "business"],
  job_title: ["title", "job title", "role", "designation", "position"],
  city: ["city", "town"],
  state: ["state", "province", "region"],
  country: ["country"],
  address: ["address", "street", "location"],
  crm_note: ["note", "notes", "comments", "remark", "remarks"],
  confidence: ["confidence", "score"]
};

const normalizeHeader = (header: string) => {
  return header
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const findValue = (row: Record<string, string>, aliases: string[]) => {
  const normalizedEntries = Object.entries(row).map(([key, value]) => ({
    key,
    normalizedKey: normalizeHeader(key),
    value
  }));

  const exact = normalizedEntries.find((entry) => aliases.includes(entry.normalizedKey));
  if (exact?.value) {
    return exact.value;
  }

  const partial = normalizedEntries.find((entry) =>
    aliases.some((alias) => entry.normalizedKey.includes(alias))
  );

  return partial?.value;
};

export interface HeuristicMappingResult {
  records: CrmRecord[];
  skipped: SkippedRecord[];
}

export const mapRowsHeuristically = (rows: PromptRow[]): HeuristicMappingResult => {
  const records: CrmRecord[] = [];
  const skipped: SkippedRecord[] = [];

  for (const row of rows) {
    const rawText = Object.values(row.values).join(" ");
    const mappedEmail = findValue(row.values, fieldAliases.email);
    const mappedPhone = findValue(row.values, fieldAliases.phone);
    const email = extractEmails(mappedEmail || rawText)[0];
    const phone = extractPhones(mappedPhone || rawText)[0];

    if (!email && !phone) {
      skipped.push({
        original_row_index: row.original_row_index,
        reason: "Missing email and phone",
        raw: row.values
      });
      continue;
    }

    records.push({
      original_row_index: row.original_row_index,
      first_name: findValue(row.values, fieldAliases.first_name),
      last_name: findValue(row.values, fieldAliases.last_name),
      full_name: findValue(row.values, fieldAliases.full_name),
      email,
      phone,
      company: findValue(row.values, fieldAliases.company),
      job_title: findValue(row.values, fieldAliases.job_title),
      city: findValue(row.values, fieldAliases.city),
      state: findValue(row.values, fieldAliases.state),
      country: findValue(row.values, fieldAliases.country),
      address: findValue(row.values, fieldAliases.address),
      status: "new",
      data_source: "csv_import",
      crm_note: findValue(row.values, fieldAliases.crm_note),
      confidence: 0.55
    });
  }

  return {
    records,
    skipped
  };
};
