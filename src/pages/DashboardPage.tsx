import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Clock3, RotateCw, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { z } from 'zod';
import FlightCard from '../components/FlightCard';
import SearchForm from '../components/SearchForm';
import SiteFooter from '../components/SiteFooter';
import { useAuth } from '../features/auth/authContext';
import { dateFlexibilitySchema, travelDateSchema, type SearchCriteria } from '../schemas/search';
import { loadMyStandbyData, type AccountRequestData, type StandbyStatus } from '../services/dashboard';
import { searchDemoFlights, type DemoFlightSort } from '../services/demoFlightSearch';

const savedSearchSchema = z.object({
  travelDate: travelDateSchema,
  flexibility: dateFlexibilitySchema,
  searchedAt: z.string().datetime(),
}).strict();
const searchHistorySchema = z.array(savedSearchSchema).max(8);
const SEARCH_HISTORY_KEY = 'seats.demo.search-history';

function dateLabel(date: string): string {
  if (!date) return 'No date selected';
  return new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00`));
}

function statusLabel(status: StandbyStatus): string {
  return status.replace(/_/g, ' ');
}

function nextStep(status: StandbyStatus): string {
  if (status === 'submitted') return 'This record shows interest only. It does not reserve inventory or create a booking.';
  if (status === 'reviewing') return 'A review status is recorded. It is not an airline decision or a confirmed seat.';
  if (status === 'withdrawn') return 'This request is marked withdrawn. No booking or ticket was issued.';
  if (status === 'declined') return 'This request is marked declined. No travel has been confirmed.';
  return 'This request is closed. No travel has been confirmed.';
}

function readSavedSearches(): { searches: z.infer<typeof searchHistorySchema>; recovered: boolean } {
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!stored) return { searches: [], recovered: false };
    const parsed = searchHistorySchema.safeParse(JSON.parse(stored));
    if (parsed.success) return { searches: parsed.data, recovered: false };
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch {
    try { localStorage.removeItem(SEARCH_HISTORY_KEY); } catch { /* Storage can be disabled by the browser. */ }
  }
  return { searches: [], recovered: true };
}

export default function DashboardPage() {
  const auth = useAuth();
  const userId = auth.session?.user.id ?? null;
  const [criteria, setCriteria] = useState<SearchCriteria>({ travelDate: '', flexibility: 'one-day' });
  const [sort, setSort] = useState<DemoFlightSort>('departure');
  const [recentSearches, setRecentSearches] = useState<z.infer<typeof searchHistorySchema>>([]);
  const [storageNotice, setStorageNotice] = useState<string | null>(null);
  const [requestData, setRequestData] = useState<(AccountRequestData & { userId: string }) | null>(null);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [reloadId, setReloadId] = useState(0);

  useEffect(() => {
    const result = readSavedSearches();
    setRecentSearches(result.searches);
    if (result.recovered) setStorageNotice('Unreadable saved searches were cleared from this browser.');
  }, []);

  useEffect(() => {
    setRequestData(null);
    setRequestError(null);
    if (!auth.configured || auth.loadingSession || !userId) {
      setRequestsLoading(false);
      return;
    }
    let active = true;
    setRequestsLoading(true);
    void loadMyStandbyData().then((data) => {
      if (active) setRequestData({ ...data, userId });
    }).catch((error: unknown) => {
      if (active) setRequestError(error instanceof Error ? error.message : 'Your account request history could not be loaded.');
    }).finally(() => {
      if (active) setRequestsLoading(false);
    });
    return () => { active = false; };
  }, [auth.configured, auth.loadingSession, userId, reloadId]);

  function persistSearches(next: z.infer<typeof searchHistorySchema>) {
    setRecentSearches(next);
    setStorageNotice(null);
    try { localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next)); }
    catch { setStorageNotice('This browser could not save the search history. The search still worked.'); }
  }

  function runSearch(nextCriteria: SearchCriteria) {
    setCriteria(nextCriteria);
    const next = [{ ...nextCriteria, searchedAt: new Date().toISOString() }, ...recentSearches].slice(0, 8);
    persistSearches(next);
  }

  const flights = useMemo(() => searchDemoFlights(criteria, sort), [criteria, sort]);
  const visibleRequestData = requestData?.userId === userId ? requestData : null;
  const historyByRequest = useMemo(() => {
    const grouped = new Map<string, AccountRequestData['history']>();
    for (const event of visibleRequestData?.history ?? []) {
      grouped.set(event.request_id, [...(grouped.get(event.request_id) ?? []), event]);
    }
    return grouped;
  }, [visibleRequestData]);

  return <>
    <main className="dashboard-page container" id="main-content">
      <div className="dashboard-overline"><span className="section-kicker">CUSTOMER ACCOUNT</span><span className="demo-label">PRIVATE REQUESTS · LOCAL DEMO SEARCHES</span></div>
      <section className="dashboard-intro"><div><span className="section-kicker">YOUR TRAVEL, AT YOUR PACE</span><h1>My <em>travel.</em></h1><p>Review your saved route searches and, when account services are connected, view the request records and status history permitted for your account.</p></div><span className="dashboard-shield"><ShieldCheck size={20} /> Account-aware view</span></section>

      <div className="dashboard-grid">
        <section className="dashboard-panel dashboard-search" aria-labelledby="dashboard-search-title">
          <div className="panel-heading"><div><span className="section-kicker">LOCAL ROUTE EXPLORER</span><h2 id="dashboard-search-title">Indore to Delhi</h2></div><Search size={20} aria-hidden="true" /></div>
          <SearchForm onSearch={runSearch} initialCriteria={criteria} key={`${criteria.travelDate}-${criteria.flexibility}`} />
          <div className="search-results-heading"><p className="panel-disclaimer">Local examples only. No airline or availability service is contacted.</p><label>Sort by <select aria-label="Sort saved dashboard schedules" value={sort} onChange={(event) => setSort(event.target.value as DemoFlightSort)}><option value="departure">Departure</option><option value="shortest">Journey length</option></select></label></div>
          <p className="dashboard-result-count" role="status">{flights.length} {flights.length === 1 ? 'demo schedule' : 'demo schedules'} in this local search</p>
          {flights.length > 0 ? <div className="dashboard-flight-list">{flights.map((flight) => <FlightCard key={flight.id} flight={flight} dateLabel={criteria.travelDate || `${dateLabel(new Date(Date.now() + flight.dateOffset * 86_400_000).toISOString().slice(0, 10))} · example`} />)}</div>
            : <div className="empty-state"><CalendarDays size={20} /><span>No local schedule matches this search. Widen the date window or clear the date; this says nothing about airline availability.</span></div>}
        </section>

        <section className="dashboard-panel" aria-labelledby="recent-searches-title">
          <div className="panel-heading"><div><span className="section-kicker">SAVED IN THIS BROWSER</span><h2 id="recent-searches-title">Recent searches</h2></div><Clock3 size={20} aria-hidden="true" /></div>
          {recentSearches.length ? <ul className="recent-search-list">{recentSearches.map((search, index) => <li key={`${search.searchedAt}-${index}`}><div><strong>IDR <i aria-hidden="true">→</i> DEL</strong><span>{search.travelDate ? dateLabel(search.travelDate) : 'Any date'} · {search.flexibility.replace('-', ' ')} flexibility</span><small>Searched {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(search.searchedAt))}</small></div><button type="button" onClick={() => runSearch({ travelDate: search.travelDate, flexibility: search.flexibility })} aria-label={`Repeat search for ${search.travelDate ? dateLabel(search.travelDate) : 'any date'}`}><ArrowRight size={17} /></button></li>)}</ul>
            : <div className="empty-state"><Search size={20} /><span>Your recent IDR–DEL searches will appear here after you explore a date range.</span></div>}
          {storageNotice && <p className="inline-note" role="status">{storageNotice}</p>}
          {recentSearches.length > 0 && <button className="text-button" type="button" onClick={() => persistSearches([])}><Trash2 size={15} /> Clear saved searches</button>}
          <p className="panel-disclaimer">Saved locally on this device. These searches are not sent to an airline or attached to your account.</p>
        </section>

        <section className="dashboard-panel requests-panel" aria-labelledby="requests-title">
          <div className="panel-heading"><div><span className="section-kicker">AUTHENTICATED ACCOUNT DATA</span><h2 id="requests-title">Standby request records</h2></div><ShieldCheck size={20} aria-hidden="true" /></div>
          {auth.loadingSession ? <div className="skeleton-stack" role="status" aria-label="Checking account session"><span /><span /><span /></div>
            : !auth.configured ? <div className="empty-state"><ShieldCheck size={20} /><span>Supabase is not configured. Account requests cannot be loaded yet; the local route explorer remains available.</span></div>
              : auth.error && !auth.session ? <div className="inline-error" role="alert"><p>{auth.error}</p><button type="button" onClick={() => void auth.refreshSession()}><RotateCw size={16} /> Retry account check</button></div>
                : !auth.session ? <div className="empty-state"><ShieldCheck size={20} /><span><a href="#auth">Sign in</a> to load request records that belong to your account.</span></div>
                  : requestsLoading ? <div className="skeleton-stack" role="status" aria-label="Loading standby request records"><span /><span /><span /></div>
                    : requestError ? <div className="inline-error" role="alert"><p>{requestError}</p><button type="button" onClick={() => setReloadId((value) => value + 1)}><RotateCw size={16} /> Retry request history</button></div>
                      : visibleRequestData?.requests.length ? <ul className="request-list">{visibleRequestData.requests.map((request) => {
                        const events = historyByRequest.get(request.id) ?? [];
                        return <li key={request.id}>
                          <div className="request-topline"><div className="request-id"><strong>Request {request.id.slice(0, 8).toUpperCase()}</strong><span>{request.traveler_count} traveler{request.traveler_count === 1 ? '' : 's'} · entered {new Date(request.created_at).toLocaleDateString('en-IN')}</span></div><span className={`request-status status-${request.status}`}>{statusLabel(request.status)}</span></div>
                          <p className="request-next-step">{nextStep(request.status)}</p>
                          <details className="request-history"><summary>Status history <span>{events.length} {events.length === 1 ? 'update' : 'updates'}</span></summary>
                            {events.length ? <ol>{events.map((event) => <li key={event.id}><time>{new Date(event.created_at).toLocaleString('en-IN')}</time><strong>{event.previous_status ? `${statusLabel(event.previous_status)} → ` : ''}{statusLabel(event.new_status)}</strong>{event.change_note && <p>{event.change_note}</p>}</li>)}</ol> : <p>No status changes are recorded for this request.</p>}
                          </details>
                          <small className="request-disclaimer">A request record is not a booking, ticket or confirmed seat.</small>
                        </li>;
                      })}</ul>
                        : <div className="empty-state"><ShieldCheck size={20} /><span>This account has no standby request records. Exploring demo schedules will not create one.</span></div>}
          <p className="panel-disclaimer">Account records are read under database authorization and row-level security. This concept does not create or confirm travel.</p>
        </section>
      </div>
    </main>
    <SiteFooter />
  </>;
}
