import { describe, expect, it } from 'vitest';
import { loginSchema, registrationSchema } from '../schemas/auth';
import { profileUpdateSchema } from '../schemas/profile';
import { standbyRequestSchema } from '../schemas/standbyRequest';
import { searchCriteriaSchema } from '../schemas/search';
import { resolveSupabaseConfig } from '../services/supabase';

describe('auth and request validation', () => {
  it('trims valid sign-in emails and rejects malformed credentials', () => {
    expect(loginSchema.parse({ email: ' user@example.test ', password: 'long-enough' }).email)
      .toBe('user@example.test');
    expect(loginSchema.safeParse({ email: 'bad-email', password: 'short' }).success).toBe(false);
  });

  it('requires matching passwords for registration', () => {
    const registration = {
      displayName: 'Traveler',
      email: 'user@example.test',
      password: 'long-enough',
      passwordConfirmation: 'different-password',
    };
    expect(registrationSchema.safeParse(registration).success).toBe(false);
    expect(registrationSchema.safeParse({ ...registration, passwordConfirmation: registration.password }).success).toBe(true);
  });

  it('allows only editable profile fields and rejects empty updates', () => {
    expect(profileUpdateSchema.safeParse({ role: 'admin' }).success).toBe(false);
    expect(profileUpdateSchema.safeParse({}).success).toBe(false);
    expect(profileUpdateSchema.parse({ displayName: ' Traveler ' }).displayName).toBe('Traveler');
  });

  it('requires an acknowledged standby request with a bounded party size', () => {
    const validRequest = {
      flightId: '00000000-0000-4000-8000-000000000002',
      travelerCount: 2,
      standbyTermsAccepted: true,
    };
    expect(standbyRequestSchema.safeParse(validRequest).success).toBe(true);
    expect(standbyRequestSchema.safeParse({ ...validRequest, travelerCount: 7 }).success).toBe(false);
    expect(standbyRequestSchema.safeParse({ ...validRequest, standbyTermsAccepted: false }).success).toBe(false);
  });

  it('accepts only supported search flexibility and current-or-future dates', () => {
    const today = new Date();
    const travelDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    expect(searchCriteriaSchema.safeParse({ travelDate, flexibility: 'three-days' }).success).toBe(true);
    expect(searchCriteriaSchema.safeParse({ travelDate: '', flexibility: 'one-day' }).success).toBe(true);
    expect(searchCriteriaSchema.safeParse({ travelDate, flexibility: 'one-week' }).success).toBe(false);
    expect(searchCriteriaSchema.safeParse({ travelDate: '2020-01-01', flexibility: 'exact' }).success).toBe(false);
  });

  it('treats the environment template values as unconfigured placeholders', () => {
    expect(resolveSupabaseConfig({
      url: 'your-supabase-project-url',
      publishableKey: 'your-supabase-publishable-key',
    })).toBeNull();
    expect(resolveSupabaseConfig({ url: '', publishableKey: '' })).toBeNull();
  });

  it('accepts publishable and legacy anon keys but rejects secret/service-role keys', () => {
    const url = 'https://project-ref.supabase.co';
    expect(resolveSupabaseConfig({ url, publishableKey: 'sb_publishable_example123' })).not.toBeNull();
    expect(resolveSupabaseConfig({ url, publishableKey: 'sb_secret_example123' })).toBeNull();

    const legacyKey = (role: string) => `header.${btoa(JSON.stringify({ role }))}.signature`;
    expect(resolveSupabaseConfig({ url, publishableKey: legacyKey('anon') })).not.toBeNull();
    expect(resolveSupabaseConfig({ url, publishableKey: legacyKey('service_role') })).toBeNull();
  });
});
