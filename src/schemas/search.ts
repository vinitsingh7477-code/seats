import { z } from 'zod';

export const travelDateSchema = z.union([z.literal(''), z.string().date()]);
export const dateFlexibilitySchema = z.enum(['exact', 'one-day', 'three-days']);

export const searchCriteriaSchema = z.object({
  travelDate: travelDateSchema,
  flexibility: dateFlexibilitySchema,
}).strict().superRefine(({ travelDate }, context) => {
  if (!travelDate) return;
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (travelDate < today) {
    context.addIssue({ code: 'custom', path: ['travelDate'], message: 'Choose today or a future date.' });
  }
});

export type SearchCriteria = z.infer<typeof searchCriteriaSchema>;
