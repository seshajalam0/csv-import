import { describe, expect, it } from "vitest";
import { extractEmails, extractPhones, normalizePhone } from "../src/services/normalization.js";

describe("normalization", () => {
  it("extracts multiple emails", () => {
    expect(extractEmails("Ada <Ada@Example.com>, grace@example.org")).toEqual([
      "ada@example.com",
      "grace@example.org"
    ]);
  });

  it("normalizes phone numbers", () => {
    expect(normalizePhone("+1 (555) 123-4567")).toBe("+15551234567");
    expect(extractPhones("Office: 555-123-4567")).toEqual(["5551234567"]);
  });
});
