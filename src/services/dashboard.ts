import { supabaseClient } from './supabase';

export type StandbyStatus = 'submitted' | 'reviewing' | 'withdrawn' | 'declined' | 'closed';

export interface StandbyRequestSummary {
  id: string;
  flight_id: string;
  traveler_count: number;
  status: StandbyStatus;
  created_at: string;
}

export interface RequestHistoryEvent {
  id: string;
  request_id: string;
  previous_status: StandbyStatus | null;
  new_status: StandbyStatus;
  change_note: string | null;
  created_at: string;
}

export interface DemoFlightSummary {
  id: string;
  flight_number: string;
  origin_iata: string;
  destination_iata: string;
  departure_at: string;
  inventory_mode: 'demo';
}

export interface AccountRequestData {
  requests: StandbyRequestSummary[];
  history: RequestHistoryEvent[];
}

export interface AdminOverview extends AccountRequestData {
  demoFlights: DemoFlightSummary[];
}

function requireClient() {
  if (!supabaseClient) throw new Error('Supabase is not configured. Add the authorized project values, then retry.');
  return supabaseClient;
}

export async function loadMyStandbyData(): Promise<AccountRequestData> {
  const client = requireClient();
  const [requestResult, historyResult] = await Promise.all([
    client.from('standby_requests')
      .select('id, flight_id, traveler_count, status, created_at')
      .order('created_at', { ascending: false }),
    client.from('standby_request_status_history')
      .select('id, request_id, previous_status, new_status, change_note, created_at')
      .order('created_at', { ascending: false }),
  ]);
  if (requestResult.error) throw requestResult.error;
  if (historyResult.error) throw historyResult.error;
  return {
    requests: (requestResult.data ?? []) as StandbyRequestSummary[],
    history: (historyResult.data ?? []) as RequestHistoryEvent[],
  };
}

export async function loadAdminOverview(): Promise<AdminOverview> {
  const client = requireClient();
  const { data: isAdmin, error: authorizationError } = await client.rpc('is_current_user_admin');
  if (authorizationError) throw authorizationError;
  if (isAdmin !== true) throw new Error('Your authenticated account does not have the trusted admin role.');

  const [requestResult, flightResult] = await Promise.all([
    client.from('standby_requests')
      .select('id, flight_id, traveler_count, status, created_at')
      .order('created_at', { ascending: false })
      .limit(100),
    client.from('flights')
      .select('id, flight_number, origin_iata, destination_iata, departure_at, inventory_mode')
      .eq('inventory_mode', 'demo')
      .order('departure_at', { ascending: true }),
  ]);
  if (requestResult.error) throw requestResult.error;
  if (flightResult.error) throw flightResult.error;

  const requests = (requestResult.data ?? []) as StandbyRequestSummary[];
  const requestIds = requests.map((request) => request.id);
  let history: RequestHistoryEvent[] = [];
  if (requestIds.length) {
    const historyResult = await client.from('standby_request_status_history')
      .select('id, request_id, previous_status, new_status, change_note, created_at')
      .in('request_id', requestIds)
      .order('created_at', { ascending: false });
    if (historyResult.error) throw historyResult.error;
    history = (historyResult.data ?? []) as RequestHistoryEvent[];
  }

  return {
    requests,
    history,
    demoFlights: (flightResult.data ?? []) as DemoFlightSummary[],
  };
}
