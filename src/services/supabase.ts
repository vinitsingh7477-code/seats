import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseConfigSchema = z.object({
  url: z.string().url().refine((value) => {
    try {
      const protocol = new URL(value).protocol;
      return protocol === 'https:' || protocol === 'http:';
    } catch {
      return false;
    }
  }),
  publishableKey: z.string().trim().min(1),
}).strict();

export type SupabaseConfigInput = z.input<typeof supabaseConfigSchema>;
export type SupabaseConfig = z.output<typeof supabaseConfigSchema>;

function isPlaceholder(value: string): boolean {
  return /^(your[-_ ]|placeholder|replace[-_ ]|example)/i.test(value.trim());
}

function isPublishableSupabaseKey(value: string): boolean {
  const key = value.trim();
  if (/^sb_publishable_[a-z0-9_-]+$/i.test(key)) return true;
  if (/^sb_secret_/i.test(key)) return false;

  // Older Supabase projects use JWT-shaped anon/service_role API keys.
  const segments = key.split('.');
  if (segments.length !== 3 || !segments[1]) return false;
  try {
    const payload = segments[1].replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const binaryPayload = atob(paddedPayload);
    const bytes = Uint8Array.from(binaryPayload, (character) => character.charCodeAt(0));
    const claims: unknown = JSON.parse(new TextDecoder().decode(bytes));
    return typeof claims === 'object' && claims !== null
      && 'role' in claims && claims.role === 'anon';
  } catch {
    return false;
  }
}

export function resolveSupabaseConfig(input: SupabaseConfigInput): SupabaseConfig | null {
  const parsed = supabaseConfigSchema.safeParse(input);
  if (!parsed.success
    || isPlaceholder(parsed.data.url)
    || isPlaceholder(parsed.data.publishableKey)
    || !isPublishableSupabaseKey(parsed.data.publishableKey)) {
    return null;
  }
  return parsed.data;
}

const supabaseConfig = resolveSupabaseConfig({
  url: import.meta.env.VITE_SUPABASE_URL ?? '',
  publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '',
});

export const supabaseConfigStatus = {
  configured: supabaseConfig !== null,
  message: supabaseConfig
    ? 'Supabase Auth is configured. Connection is checked when the session loads.'
    : 'Supabase Auth is not configured. Demo browsing is available; account actions are disabled.',
};

export const supabaseClient = supabaseConfig
  ? createClient(supabaseConfig.url, supabaseConfig.publishableKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
  : null;
