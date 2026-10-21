import { useEffect, useMemo, useState } from 'react';
import { Activity, ClipboardList, Database, RotateCw, Search, ShieldCheck } from 'lucide-react';
import SiteFooter from '../components/SiteFooter';
import { useAuth } from '../features/auth/authContext';
import { loadAdminOverview, type AdminOverview, type StandbyStatus } from '../services/dashboard';

type AdminState = 'checking' | 'denied' | 'error' | 'ready';
type StatusFilter = 'all' | StandbyStatus;

const statusOptions: StatusFilter[] = ['all', 'submitted', 'reviewing', 'withdrawn', 'declined', 'closed'];

function statusLabel(status: StandbyStatus): string {
  return status.replace(/_/g, ' ');
}

export default function AdminDashboard() {
  const auth = useAuth();
  const userId = auth.session?.user.id ?? null;
  const [state, setState] = useState<AdminState>('checking');
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<(AdminOverview & { userId: string }) | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');
  const [reloadId, setReloadId] = useState(0);

  useEffect(() => {
    setOverview(null);
    setError(null);
    if (auth.loadingSession) {
      setState('checking');
      return;
    }
    let active = true;
    if (!auth.configured || !userId) {
      setState('denied');
      return () => { active = false; };
    }

    setState('checking');
    void loadAdminOverview().then((nextOverview) => {
      if (!active) return;
      setOverview({ ...nextOverview, userId });
      setState('ready');
    }).catch((adminError: unknown) => {
      if (!active) return;
      setError(adminError instanceof Error ? adminError.message : 'Database authorization could not be verified.');
      setState('error');
    });
    return () => { active = false; };
  }, [auth.configured, auth.loadingSession, userId, reloadId]);

  const currentOverview = overview?.userId === userId ? overview : null;
  const filteredRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return (currentOverview?.requests ?? []).filter((request) => {
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      const matchesQuery = !normalizedQuery || request.id.toLowerCase().includes(normalizedQuery)
        || request.flight_id.toLowerCase().includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [currentOverview, query, statusFilter]);
  const reviewing = currentOverview?.requests.filter((request) => request.status === 'reviewing').length ?? 0;
  const historyByRequest = useMemo(() => {
    const grouped = new Map<string, AdminOverview['history']>();
    for (const event of currentOverview?.history ?? []) {
      grouped.set(event.request_id, [...(grouped.get(event.request_id) ?? []), event]);
    }
    return grouped;
  }, [currentOverview]);

  return <>
    <main className="admin-page container" id="main-content">
      <div className="dashboard-overline"><span className="section-kicker">OPERATIONS</span><span className="demo-label">PROTECTED · DATABASE AUTHORIZATION REQUIRED</span></div>
      <section className="dashboard-intro admin-intro"><div><span className="section-kicker">SEATS CONTROL ROOM</span><h1>Operations <em>view.</em></h1><p>Review request records and explicitly marked demo schedules. Access is verified by a trusted database role check and row-level security.</p></div><span className="dashboard-shield"><ShieldCheck size={20} /> Protected route</span></section>

      {state === 'checking' && <div className="admin-access-card" role="status"><div className="skeleton-stack"><span /><span /><span /></div><p>Checking the current account and requesting authorization from the database…</p></div>}
      {state === 'denied' && <div className="admin-access-card" role="alert"><ShieldCheck size={24} /><div><strong>Operations data is unavailable</strong><p>{auth.configured ? 'Sign in with an account that has been assigned an admin role by a trusted operator.' : 'Supabase is not configured, so database authorization cannot be checked.'}</p><span>This route stays locked. No request or inventory data has been loaded.</span></div>{auth.configured && <a href="#auth">Account access</a>}</div>}
      {state === 'error' && <div className="admin-access-card admin-access-error" role="alert"><ShieldCheck size={24} /><div><strong>Authorization could not be verified</strong><p>{error}</p><span>The dashboard remains locked until the database confirms this account’s admin role.</span></div><button type="button" onClick={() => setReloadId((value) => value + 1)}><RotateCw size={16} /> Retry authorization</button></div>}

      {state === 'ready' && currentOverview && <>
        <section className="metrics-grid" aria-label="Database-derived operational metrics">
          <article className="metric-card"><span><ClipboardList size={18} /> Requests in latest result</span><strong>{currentOverview.requests.length}</strong><small>Up to 100 most recent records · request only</small></article>
          <article className="metric-card"><span><Activity size={18} /> Marked in review</span><strong>{reviewing}</strong><small>Within the latest request result</small></article>
          <article className="metric-card"><span><Database size={18} /> Demo schedules</span><strong>{currentOverview.demoFlights.length}</strong><small>Illustrative rows · not live inventory</small></article>
        </section>

        <section className="dashboard-panel admin-data-panel" aria-labelledby="admin-requests-title">
          <div className="panel-heading"><div><span className="section-kicker">CUSTOMER ACTIVITY</span><h2 id="admin-requests-title">Standby request records</h2><p>Read-only view of the latest records permitted by your database role.</p></div><span className="demo-label">RLS-PROTECTED</span></div>
          <div className="admin-filter-bar"><label><span>Filter by status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}>{statusOptions.map((status) => <option value={status} key={status}>{status === 'all' ? 'All statuses' : statusLabel(status)}</option>)}</select></label><label className="admin-query"><span>Search request or flight ID</span><span className="admin-search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Enter an ID" /></span></label><p role="status">Showing {filteredRequests.length} of {currentOverview.requests.length} loaded requests</p></div>
          {filteredRequests.length ? <div className="admin-table-wrap"><table className="admin-table"><caption className="visually-hidden">Read-only standby request records returned by the authorized database query</caption><thead><tr><th scope="col">Request</th><th scope="col">Created</th><th scope="col">Travellers</th><th scope="col">Status</th><th scope="col">Audit context</th></tr></thead><tbody>{filteredRequests.map((request) => {
            const events = historyByRequest.get(request.id) ?? [];
            return <tr key={request.id}><td><strong>{request.id.slice(0, 8).toUpperCase()}</strong></td><td>{new Date(request.created_at).toLocaleDateString('en-IN')}</td><td>{request.traveler_count}</td><td><span className={`request-status status-${request.status}`}>{statusLabel(request.status)}</span></td><td><details className="audit-details"><summary>{events.length} {events.length === 1 ? 'change' : 'changes'}</summary>{events.length ? <ol>{events.map((event) => <li key={event.id}><time>{new Date(event.created_at).toLocaleString('en-IN')}</time><strong>{event.previous_status ? `${statusLabel(event.previous_status)} → ` : ''}{statusLabel(event.new_status)}</strong>{event.change_note && <p>{event.change_note}</p>}</li>)}</ol> : <p>No status changes are recorded.</p>}</details></td></tr>;
          })}</tbody></table></div> : <div className="empty-state"><ClipboardList size={21} /><span>{currentOverview.requests.length ? 'No loaded request matches these filters. Clear the search or choose another status.' : 'No standby request records are present in the authorized result.'}</span></div>}
          <p className="panel-disclaimer">A status describes an application record. It never means a seat, booking or ticket is confirmed.</p>
        </section>

        <section className="dashboard-panel admin-data-panel" aria-labelledby="admin-demo-title">
          <div className="panel-heading"><div><span className="section-kicker">DATABASE DEMONSTRATION RECORDS</span><h2 id="admin-demo-title">Demo schedules</h2><p>These rows exist to exercise protected reads and route presentation.</p></div><span className="demo-label">NEVER CONFIRMED</span></div>
          {currentOverview.demoFlights.length ? <div className="admin-demo-list">{currentOverview.demoFlights.map((flight) => <article key={flight.id}><span className="demo-pill">DEMO</span><strong>{flight.origin_iata} <i aria-hidden="true">→</i> {flight.destination_iata}</strong><span>{flight.flight_number}</span><time>{new Date(flight.departure_at).toLocaleString('en-IN')}</time><small>Illustrative database record · not airline-authorized inventory</small></article>)}</div>
            : <div className="empty-state"><Database size={21} /><span>No demo schedule rows are available in this database.</span></div>}
        </section>
        <p className="admin-note"><ShieldCheck size={17} /> This view does not provide inventory editing, airline decisions, seat sales or booking operations.</p>
      </>}
    </main>
    <SiteFooter />
  </>;
}
