import { profileUpdateSchema } from '../schemas/profile';
import { standbyRequestSchema } from '../schemas/standbyRequest';
import { supabaseClient } from './supabase';

function requireSupabaseClient() {
  if (!supabaseClient) {
    throw new Error('Supabase is not configured. Demo mode remains available.');
  }
  return supabaseClient;
}

/** Persists only the profile columns granted to authenticated users by the migration. */
export async function updateOwnProfile(input: unknown) {
  const profile = profileUpdateSchema.parse(input);
  const supabase = requireSupabaseClient();
  const update: { display_name?: string | null; phone?: string | null } = {};
  if (profile.displayName !== undefined) update.display_name = profile.displayName;
  if (profile.phone !== undefined) update.phone = profile.phone;

  const { data, error } = await supabase
    .from('profiles')
    .update(update)
    .select('id, display_name, phone, created_at, updated_at')
    .single();
  if (error) throw error;
  return data;
}

/** Calls the database RPC, which rechecks auth, terms, party size, and airline authorization. */
export async function submitStandbyRequest(input: unknown): Promise<string> {
  const request = standbyRequestSchema.parse(input);
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase.rpc('submit_standby_request', {
    p_flight_id: request.flightId,
    p_traveler_count: request.travelerCount,
    p_standby_terms_accepted: request.standbyTermsAccepted,
  });
  if (error) throw error;
  if (typeof data !== 'string') throw new Error('The standby request response was invalid.');
  return data;
}
