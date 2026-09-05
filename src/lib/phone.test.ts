import { describe, expect, it } from "vitest";
import { normalizeIndianPhone } from "./phone";

describe("normalizeIndianPhone", () => {
  it.each([["98765 43210", "+919876543210"], ["+91 98765-43210", "+919876543210"], ["919876543210", "+919876543210"]])("normalizes %s", (input, output) => expect(normalizeIndianPhone(input)).toBe(output));
  it.each(["12345", "5876543210", "001234567890"])("rejects %s", (input) => expect(normalizeIndianPhone(input)).toBeNull());
});
