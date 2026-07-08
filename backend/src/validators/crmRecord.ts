import { z } from "zod";
import { crmDataSources, crmStatuses } from "../types/crm.js";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

export const crmRecordSchema = z
  .object({
    original_row_index: z.coerce.number().int().nonnegative(),
    first_name: z.preprocess(emptyToUndefined, z.string().max(120).optional()),
    last_name: z.preprocess(emptyToUndefined, z.string().max(120).optional()),
    full_name: z.preprocess(emptyToUndefined, z.string().max(240).optional()),
    email: z.preprocess(emptyToUndefined, z.string().email().optional()),
    phone: z.preprocess(emptyToUndefined, z.string().min(7).max(30).optional()),
    company: z.preprocess(emptyToUndefined, z.string().max(180).optional()),
    job_title: z.preprocess(emptyToUndefined, z.string().max(180).optional()),
    city: z.preprocess(emptyToUndefined, z.string().max(120).optional()),
    state: z.preprocess(emptyToUndefined, z.string().max(120).optional()),
    country: z.preprocess(emptyToUndefined, z.string().max(120).optional()),
    address: z.preprocess(emptyToUndefined, z.string().max(320).optional()),
    status: z.enum(crmStatuses).default("new"),
    data_source: z.enum(crmDataSources).default("csv_import"),
    crm_note: z.preprocess(emptyToUndefined, z.string().max(4000).optional()),
    confidence: z.coerce.number().min(0).max(1).optional()
  })
  .refine((record) => Boolean(record.email || record.phone), {
    message: "Record must include an email or phone."
  });

export const skippedRecordSchema = z.object({
  original_row_index: z.coerce.number().int().nonnegative(),
  reason: z.string().min(1)
});
