import type { CrmRecord } from "../types/crm.js";

const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const phonePattern = /(?:\+?\d[\d\s().-]{6,}\d)/g;

export const extractEmails = (value: string | undefined) => {
  if (!value) {
    return [];
  }

  return Array.from(new Set(value.match(emailPattern)?.map((email) => email.toLowerCase()) ?? []));
};

export const normalizePhone = (value: string | undefined) => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");

  if (digits.length < 7) {
    return undefined;
  }

  return `${hasPlus ? "+" : ""}${digits}`;
};

export const extractPhones = (value: string | undefined) => {
  if (!value) {
    return [];
  }

  return Array.from(
    new Set(
      (value.match(phonePattern) ?? [])
        .map((phone) => normalizePhone(phone))
        .filter((phone): phone is string => Boolean(phone))
    )
  );
};

const appendNote = (note: string | undefined, addition: string) => {
  return [note, addition].filter(Boolean).join("\n");
};

export const normalizeCrmRecord = (record: CrmRecord, rawRow?: Record<string, string>): CrmRecord => {
  const rawText = rawRow ? Object.values(rawRow).join(" ") : "";
  const emails = Array.from(new Set([...(record.email ? [record.email] : []), ...extractEmails(rawText)]));
  const phones = Array.from(new Set([...(record.phone ? [record.phone] : []), ...extractPhones(rawText)]));

  const primaryEmail = emails[0]?.toLowerCase();
  const primaryPhone = normalizePhone(phones[0]);
  let crmNote = record.crm_note;

  if (emails.length > 1) {
    crmNote = appendNote(crmNote, `Extra emails: ${emails.slice(1).join(", ")}`);
  }

  if (phones.length > 1) {
    crmNote = appendNote(crmNote, `Extra phones: ${phones.slice(1).join(", ")}`);
  }

  return {
    ...record,
    email: primaryEmail,
    phone: primaryPhone,
    crm_note: crmNote,
    full_name: record.full_name || [record.first_name, record.last_name].filter(Boolean).join(" ") || undefined
  };
};
