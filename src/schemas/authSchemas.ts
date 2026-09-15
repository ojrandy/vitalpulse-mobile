import { z } from 'zod';

/**
 * E.164 format, matching `users.phone` in docs/03DATAMODEL.md — the primary
 * identity field. Keep this the one place phone format is validated so a
 * future Cloud Function schema can import the same shape without drift.
 */
export const phoneNumberSchema = z.object({
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/, 'errorInvalid'),
});
export type PhoneNumberInput = z.infer<typeof phoneNumberSchema>;

export const otpCodeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'errorInvalid'),
});
export type OtpCodeInput = z.infer<typeof otpCodeSchema>;

export const emailLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type EmailLoginInput = z.infer<typeof emailLoginSchema>;
