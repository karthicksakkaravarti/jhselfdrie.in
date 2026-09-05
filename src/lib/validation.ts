import { z } from "zod";
import { normalizeIndianPhone } from "./phone";

export const enquirySchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  phone: z.string().trim().transform((value, ctx) => {
    const phone = normalizeIndianPhone(value);
    if (!phone) {
      ctx.addIssue({ code: "custom", message: "Enter a valid 10-digit Indian mobile number" });
      return z.NEVER;
    }
    return phone;
  }),
  carSlug: z.string().trim().min(1, "Choose a car"),
  pickupDate: z.coerce.date({ error: "Choose a pickup date" }),
  returnDate: z.coerce.date({ error: "Choose a return date" }),
  message: z.string().trim().max(500).optional().default(""),
  website: z.string().max(0, "Invalid submission").optional().default(""),
  startedAt: z.coerce.number().int().positive(),
  sessionId: z.string().trim().min(8).max(100),
  source: z.string().trim().max(100).optional().default("website"),
  utmSource: z.string().trim().max(200).optional().default(""),
  utmMedium: z.string().trim().max(200).optional().default(""),
  utmCampaign: z.string().trim().max(200).optional().default(""),
}).superRefine((data, ctx) => {
  if (data.returnDate < data.pickupDate) ctx.addIssue({ code: "custom", path: ["returnDate"], message: "Return must be after pickup" });
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
