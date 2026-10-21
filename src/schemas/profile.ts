import { z } from 'zod';

const phoneSchema = z.union([
  z.string().trim().min(7).max(32).regex(/^[+0-9(). -]+$/),
  z.literal(''),
  z.null(),
]).optional().transform((value) => value === '' ? null : value);

export const profileUpdateSchema = z.object({
  displayName: z.string().trim().min(1).max(100).nullable().optional(),
  phone: phoneSchema,
}).strict().refine((values) => Object.keys(values).length > 0, {
  message: 'Provide at least one profile field to update.',
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
