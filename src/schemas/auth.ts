import { z } from 'zod';

const emailSchema = z.string().trim().email().max(254);
const passwordSchema = z.string().min(8).max(128);

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
}).strict();

export const registrationSchema = z.object({
  displayName: z.string().trim().min(1).max(100),
  email: emailSchema,
  password: passwordSchema,
  passwordConfirmation: z.string(),
}).strict().refine((values) => values.password === values.passwordConfirmation, {
  path: ['passwordConfirmation'],
  message: 'Passwords do not match.',
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
