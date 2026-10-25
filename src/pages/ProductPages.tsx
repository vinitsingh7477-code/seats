import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowLeftRight, ArrowRight, Check, ShieldCheck } from 'lucide-react';
import SiteFooter from '../components/SiteFooter';
import AuthPanel from '../features/auth/AuthPanel';
import { airportOptions, airports, findDemoRoute, getAirport, isAirportCode, type AirportCode } from '../data/routes';

type DemoPrefs = { origin: AirportCode; destination: AirportCode; departure: string; passengers: number; plan: string; demoRequest: boolean };
const STORAGE_KEY = 'seats.demo.membership.v1';
const plans = [
  { id: 'flex', name: 'Flex', price: '₹499', cadence: '/ month · illustrative', detail: 'One active route preference', features: ['One traveler', 'One preferred route', 'Demo status updates'] },
  { id: 'plus', name: 'Flex Plus', price: '₹899', cadence: '/ month · illustrative', detail: 'More room for changing plans', features: ['Up to two travelers', 'Two saved route preferences', 'Demo status updates'] },
  { id: 'group', name: 'Group', price: '₹1,499', cadence: '/ month · illustrative', detail: 'A group travel concept', features: ['Up to four travelers', 'Three saved route preferences', 'Demo status updates'] },
];

function readPrefs(): DemoPrefs {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    if (typeof parsed === 'object' && parsed !== null) {
      const value = parsed as Partial<DemoPrefs>;
      return { origin: isAirportCode(value.origin) ? value.origin : 'IDR', destination: isAirportCode(value.destination) ? value.destination : 'DEL', departure: typeof value.departure === 'string' ? value.departure : '', passengers: Number(value.passengers) || 1, plan: typeof value.plan === 'string' ? value.plan : '', demoRequest: value.demoRequest === true };
    }
  } catch { /* Local demo settings can be reset if browser storage is unavailable. */ }
  return { origin: 'IDR', destination: 'DEL', departure: '', passengers: 1, plan: '', demoRequest: false };
}
function savePrefs(prefs: DemoPrefs) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch { /* The current page remains usable without persistence. */ } }
function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function queryUrl(path: string, values: Record<string, string | number>) { const query = new URLSearchParams(Object.entries(values).map(([key, value]) => [key, String(value)])); return `${path}?${query}`; }

export function HomeProductPanel() {
  const [route, setRoute] = useState<{ origin: AirportCode; destination: AirportCode; departure: string; passengers: number }>({ origin: 'IDR', destination: 'DEL', departure: '', passengers: 1 });
  const origin = getAirport(route.origin); const destination = getAirport(route.destination);
  function submit(event: FormEvent) { event.preventDefault(); window.location.href = queryUrl('/search', route); }
  return <section id="search" className="hero-route-panel" aria-labelledby="product-search-title">
    <div className="hero-route-panel-heading"><div><span className="section-kicker">START WITH A ROUTE</span><h2 id="product-search-title">Where to next?</h2></div><span className="route-note">Explore the idea</span></div>
    <div className="hero-route-display" aria-live="polite">
      <div className="hero-route-endpoint"><span>FROM</span><strong>{origin?.city ?? route.origin}</strong><small>{route.origin} · {origin?.region ?? 'Airport'}</small></div>
      <svg className="hero-route-arc" viewBox="0 0 220 90" aria-hidden="true"><path d="M12 68 C62 3 152 3 208 52" /><circle cx="12" cy="68" r="5" /><circle cx="208" cy="52" r="5" /></svg>
      <div className="hero-route-endpoint hero-route-destination"><span>TO</span><strong>{destination?.city ?? route.destination}</strong><small>{route.destination} · {destination?.region ?? 'Airport'}</small></div>
    </div>
    <div className="destination-options" role="group" aria-label="Choose a destination from Indore">
      {airportOptions.filter((airport) => airport.code !== 'IDR').map((airport) => <button className="destination-chip" key={airport.code} type="button" aria-label={`${airport.city} (${airport.code})`} aria-pressed={route.origin === 'IDR' && route.destination === airport.code} onClick={() => setRoute({ ...route, origin: 'IDR', destination: airport.code })}><span>{airport.city}</span><small>{airport.code}</small></button>)}
    </div>
    <form className="product-form hero-search-form" onSubmit={submit}>
      <label>From<select value={route.origin} onChange={(e) => setRoute({ ...route, origin: e.target.value as AirportCode })}>{airportOptions.map((airport) => <option key={airport.code} value={airport.code}>{airport.city} ({airport.code})</option>)}</select></label>
      <button className="swap-route" type="button" aria-label="Swap origin and destination" onClick={() => setRoute({ ...route, origin: route.destination, destination: route.origin })}><ArrowLeftRight size={18} /></button>
      <label>To<select value={route.destination} onChange={(e) => setRoute({ ...route, destination: e.target.value as AirportCode })}>{airportOptions.map((airport) => <option key={airport.code} value={airport.code}>{airport.city} ({airport.code})</option>)}</select></label>
      <label>Departure<input type="date" min={today()} value={route.departure} onChange={(e) => setRoute({ ...route, departure: e.target.value })} /></label>
      <label>Passengers<select value={route.passengers} onChange={(e) => setRoute({ ...route, passengers: Number(e.target.value) })}>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} passenger{n > 1 ? 's' : ''}</option>)}</select></label>
      <button className="button-primary" type="submit">Explore route options <ArrowRight size={16} /></button>
    </form>
    <p className="route-disclosure"><ShieldCheck size={15} /> Illustrative schedules only · Airline inventory is not connected.</p>
  </section>;
}
function Shell({ title, kicker, children }: { title: string; kicker: string; children: ReactNode }) {
  useEffect(() => { document.title = `${title} | SEATS`; }, [title]);
  return <><main id="main-content" className="product-page container"><a className="back-link" href="/">← SEATS home</a><header className="product-page-heading"><span className="section-kicker">{kicker}</span><h1>{title}</h1></header>{children}</main><SiteFooter /></>;
}

function SearchPage() {
  const params = new URLSearchParams(window.location.search);
  const initial = readPrefs();
  const [form, setForm] = useState({ origin: params.get('origin') ?? initial.origin, destination: params.get('destination') ?? initial.destination, departure: params.get('departure') ?? initial.departure, passengers: Math.max(1, Math.min(4, Number(params.get('passengers')) || initial.passengers)) });
  const [searched, setSearched] = useState(true);
  const route = findDemoRoute(form.origin, form.destination);
  const invalid = form.origin === form.destination;
  const originAirport = getAirport(form.origin);
  const destinationAirport = getAirport(form.destination);
  function submit(event: FormEvent) { event.preventDefault(); setSearched(true); window.history.replaceState({}, '', queryUrl('/search', form)); }
  const results = route?.schedules ?? [];
  const unsupported = !route && !invalid;
  const selectOptions = (value: string) => <>{!isAirportCode(value) && <option value={value}>{value} (unsupported)</option>}{airportOptions.map((airport) => <option key={airport.code} value={airport.code}>{airport.city} ({airport.code})</option>)}</>;
  return <Shell title="Route explorer" kicker="DEMO SEARCH"><form className="product-form product-form-card" onSubmit={submit}>
    <label>From<select value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })}>{selectOptions(form.origin)}</select></label><button className="swap-route" type="button" aria-label="Swap origin and destination" onClick={() => setForm({ ...form, origin: form.destination, destination: form.origin })}><ArrowLeftRight size={18} /></button>
    <label>To<select value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })}>{selectOptions(form.destination)}</select></label><label>Departure<input type="date" min={today()} value={form.departure} onChange={(e) => setForm({ ...form, departure: e.target.value })} /></label><label>Passengers<select value={form.passengers} onChange={(e) => setForm({ ...form, passengers: Number(e.target.value) })}>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} passenger{n > 1 ? 's' : ''}</option>)}</select></label><button className="button-primary" type="submit">Update search <ArrowRight size={16} /></button>
    </form>
    {invalid && <p className="inline-error" role="alert">Choose two different airports to search.</p>}
    {unsupported && <p className="inline-error" role="alert">We don’t have illustrative schedules for {originAirport?.city ?? form.origin} to {destinationAirport?.city ?? form.destination} yet. Choose a route from Indore to see the local examples.</p>}
    <p className="demo-banner"><ShieldCheck size={18} /> Demo data — not live airline availability. No airline is contacted.</p>
    {searched && route ? <><p className="result-count">{results.length} illustrative schedules · {originAirport?.city} to {destinationAirport?.city}{form.departure ? ` · ${form.departure}` : ''}</p><div className="product-cards">{results.map((item) => <article className="product-card schedule-card" key={item.id}><span className="demo-pill">DEMO SCHEDULE</span><h2>{item.departure} <span>→</span> {item.arrival}</h2><p>{originAirport?.city} ({form.origin}) to {destinationAirport?.city} ({form.destination}) · {item.duration}</p><p>{form.passengers} traveler{form.passengers > 1 ? 's' : ''} · Availability not connected</p><a className="button-primary" href={queryUrl('/plans', { ...form, flight: item.id })}>Review plans <ArrowRight size={16} /></a></article>)}</div></> : <div className="empty-state">No local schedules to show. Choose a supported route and try again.</div>}
  </Shell>;
}

function PlansPage() {
  const params = new URLSearchParams(window.location.search); const selectedFlight = params.get('flight') ?? 'local-1'; const prefs = readPrefs();
  return <Shell title="Plans for flexible travel" kicker="ILLUSTRATIVE MEMBERSHIP CONCEPT"><p className="product-lede">These sample prices describe a product concept. SEATS is not selling subscriptions or accepting payments.</p><div className="product-cards plan-grid">{plans.map((plan) => <article key={plan.id} className={`product-card plan-card${plan.id === 'plus' ? ' plan-featured' : ''}`}><span className="section-kicker">{plan.id === 'plus' ? 'MORE FLEXIBILITY' : 'DEMO PLAN'}</span><h2>{plan.name}</h2><p className="plan-price">{plan.price}<small>{plan.cadence}</small></p><p>{plan.detail}</p><ul>{plan.features.map((feature) => <li key={feature}><Check size={16} />{feature}</li>)}</ul><p className="plan-terms">Illustrative limits only. Eligibility, cancellation, refunds, and terms would need to be defined before any real offer.</p><a className="button-primary" href={queryUrl('/membership', { plan: plan.id, flight: selectedFlight, origin: params.get('origin') ?? prefs.origin, destination: params.get('destination') ?? prefs.destination, departure: params.get('departure') ?? '', passengers: params.get('passengers') ?? 1 })}>Select for demo <ArrowRight size={16} /></a></article>)}</div><p className="demo-banner"><ShieldCheck size={18} /> No payment is collected and no payment success is simulated.</p></Shell>;
}

function MembershipPage() {
  const params = new URLSearchParams(window.location.search); const [prefs, setPrefs] = useState(() => readPrefs()); const requested = params.get('plan');
  useEffect(() => { if (requested && plans.some((item) => item.id === requested)) { const query = new URLSearchParams(window.location.search); const current = readPrefs(); const next = { ...current, plan: requested, origin: isAirportCode(query.get('origin')) ? query.get('origin') as AirportCode : current.origin, destination: isAirportCode(query.get('destination')) ? query.get('destination') as AirportCode : current.destination, departure: query.get('departure') ?? current.departure, passengers: Number(query.get('passengers')) || current.passengers }; setPrefs(next); savePrefs(next); } }, [requested]);
  const selected = plans.find((plan) => plan.id === prefs.plan);
  return <Shell title="Your demo membership" kicker="MEMBERSHIP"><div className="product-cards membership-grid"><section className="product-card"><span className="status-badge">DEMO · NOT ACTIVE</span><h2>{selected?.name ?? 'No plan selected'}</h2><p>{selected ? `${selected.price} ${selected.cadence}` : 'Explore illustrative plans to choose a preference.'}</p><p>This is a browser-only demo preference. It is not a paid subscription.</p><a className="text-link" href="/plans">Change plan <ArrowRight size={16} /></a></section><section className="product-card"><span className="section-kicker">ROUTE PREFERENCE</span><h2>{airports[prefs.origin].city} → {airports[prefs.destination].city}</h2><p>{prefs.departure || 'No departure date selected'} · {prefs.passengers} traveler{prefs.passengers > 1 ? 's' : ''}</p><a className="text-link" href="/search">Change route preference <ArrowRight size={16} /></a></section><section className="product-card"><span className="section-kicker">NEXT STEP</span><h2>See the demo journey</h2><p>Explore how a simulated standby request might be presented. No airline request will be sent.</p><a className="button-primary" href="/standby">View standby journey <ArrowRight size={16} /></a></section></div><p className="demo-banner"><ShieldCheck size={18} /> Preferences are saved in this browser only. No payment details or account credentials are stored here.</p></Shell>;
}

function StandbyPage() {
  const [prefs, setPrefs] = useState(() => readPrefs());
  function createDemo() { const next = { ...prefs, demoRequest: true }; setPrefs(next); savePrefs(next); }
  const steps = ['Route selected', 'Eligibility would be checked by an authorized service', prefs.demoRequest ? 'Demo request recorded in this browser' : 'No request submitted'];
  return <Shell title="Standby journey" kicker="SIMULATED JOURNEY"><p className="demo-banner"><ShieldCheck size={18} /> Demo journey · Not connected to an airline</p><section className="product-card journey-card"><div><span className="section-kicker">ROUTE</span><h2>{airports[prefs.origin].city} ({prefs.origin}) → {airports[prefs.destination].city} ({prefs.destination})</h2><p>{prefs.departure || 'Date not selected'} · {prefs.passengers} traveler{prefs.passengers > 1 ? 's' : ''}</p></div><ol className="journey-timeline">{steps.map((step, index) => <li key={step} className={index < (prefs.demoRequest ? 3 : 1) ? 'is-done' : ''}><span>{index + 1}</span><div><strong>{step}</strong><small>{index === 2 ? (prefs.demoRequest ? 'Awaiting simulated update. No booking or ticket.' : 'Use the button below to save a local demo state.') : 'A future integrated service would provide this information.'}</small></div></li>)}</ol><button type="button" className="button-primary" onClick={createDemo}>{prefs.demoRequest ? 'Refresh local demo state' : 'Create local demo request'} <ArrowRight size={16} /></button></section></Shell>;
}

function InfoPage({ kind }: { kind: string }) {
  const content: Record<string, { title: string; kicker: string; intro: string; items: [string, string][] }> = {
    '/how-it-works': { title: 'How standby could work', kicker: 'THE PROPOSED JOURNEY', intro: 'Standby is a possibility that depends on airline rules and actual operating conditions. A request is never a confirmed seat.', items: [['1. Choose a route', 'Share a route and date range that works for you. This prototype only shows local examples.'], ['2. Check eligibility', 'A future airline-authorized service would explain applicable rules before recording a request.'], ['3. Wait for an outcome', 'Only the airline can determine whether travel is possible. Until then, keep a confirmed alternative if you need certainty.']] },
    '/faq': { title: 'Frequently asked questions', kicker: 'CLEAR ANSWERS', intro: 'SEATS is a product concept. These answers explain the current demo and the proposed service.', items: [['Does standby confirm a seat?', 'No. A standby request is not a reservation, ticket, or guarantee of travel.'], ['Is airline availability connected?', 'No. All schedules here are illustrative local demo data.'], ['Are these subscription prices available?', 'No. Any prices shown are illustrative only; no plan is offered for sale.'], ['Can I pay or get a refund?', 'Payments are not accepted. Real cancellation and refund terms have not been set.'], ['Does the demo contact an airline?', 'No. Search and journey actions stay in this browser.']] },
    '/privacy': { title: 'Privacy information', kicker: 'DRAFT · NOT LEGALLY REVIEWED', intro: 'This prototype is not a live travel service. Do not enter sensitive personal information into demo forms.', items: [['Demo preferences', 'A plan and route preference may be stored in local browser storage on this device. You can clear it through your browser settings.'], ['Support form', 'The support form gives local feedback only; it does not send or retain a message on a server.'], ['Accounts', 'Supabase account features are available only when an authorized project is configured. This draft does not replace a reviewed privacy notice.']] },
    '/terms': { title: 'Terms of use', kicker: 'DRAFT · NOT LEGALLY REVIEWED', intro: 'This concept experience is provided for demonstration and discussion only.', items: [['No travel offer', 'Schedules, plans, and prices are illustrative and are not offers of transport or membership.'], ['No booking', 'The demo cannot book flights, reserve seats, issue tickets, take payment, or confirm airline availability.'], ['Future service', 'Any operating service would require defined eligibility, cancellation, payment, and travel terms before launch.']] },
  };
  const page = content[kind]; return <Shell title={page.title} kicker={page.kicker}><p className="product-lede">{page.intro}</p><div className="info-list">{page.items.map(([title, text]) => <article className="product-card" key={title}><h2>{title}</h2><p>{text}</p></article>)}</div></Shell>;
}

function ContactPage() {
  const [sent, setSent] = useState(false); const [error, setError] = useState('');
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const email = String(data.get('email') ?? ''); const message = String(data.get('message') ?? '').trim(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10) { setError('Enter a valid email and a message of at least 10 characters.'); setSent(false); return; } setError(''); setSent(true); event.currentTarget.reset(); }
  return <Shell title="Contact and support" kicker="LOCAL DEMO FORM"><p className="product-lede">This form validates your message in this browser. It does not send email or store a support request.</p><form className="support-form product-card" onSubmit={submit}><label>Your email<input name="email" type="email" required maxLength={254} /></label><label>How can we help?<textarea name="message" required minLength={10} maxLength={1000} rows={5} /></label><button className="button-primary" type="submit">Preview demo submission <ArrowRight size={16} /></button>{error && <p className="inline-error" role="alert">{error}</p>}{sent && <p className="success-note" role="status">Demo feedback received in this page only. No email was sent.</p>}</form></Shell>;
}

function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  return <Shell title={mode === 'login' ? 'Sign in to SEATS' : 'Create a SEATS account'} kicker="ACCOUNT ACCESS"><p className="product-lede">Use the existing Supabase Auth connection when configured. Without it, account actions remain unavailable; no demo sign-in is claimed.</p><div className="auth-page-card"><AuthPanel initialMode={mode === 'login' ? 'sign-in' : 'sign-up'} /><a className="text-link" href={mode === 'login' ? '/signup' : '/login'}>{mode === 'login' ? 'Create an account' : 'Already have an account? Sign in'} <ArrowRight size={16} /></a></div></Shell>;
}

export default function ProductPages({ path }: { path: string }) {
  if (path === '/search') return <SearchPage />;
  if (path === '/plans') return <PlansPage />;
  if (path === '/membership') return <MembershipPage />;
  if (path === '/standby') return <StandbyPage />;
  if (path === '/contact') return <ContactPage />;
  if (path === '/login' || path === '/signup') return <AuthPage mode={path.slice(1) as 'login' | 'signup'} />;
  return <InfoPage kind={path} />;
}
