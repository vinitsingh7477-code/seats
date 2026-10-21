import { z } from 'zod';

export const standbyRequestSchema = z.object({
  flightId: z.string().uuid(),
  travelerCount: z.number().int().min(1).max(6),
  standbyTermsAccepted: z.literal(true),
}).strict();

export type StandbyRequestInput = z.infer<typeof standbyRequestSchema>;
