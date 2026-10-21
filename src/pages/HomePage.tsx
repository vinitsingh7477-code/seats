import { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowRight, Check, Info, Plane, ShieldCheck } from 'lucide-react';
import FlightCard from '../components/FlightCard';
import SearchForm from '../components/SearchForm';
import SiteFooter from '../components/SiteFooter';
import AuthPanel from '../features/auth/AuthPanel';
import TravelAssistant from '../features/assistant/TravelAssistant';
import { route } from '../data/flights';
import type { SearchCriteria } from '../schemas/search';
import { searchDemoFlights, type DemoFlightSort } from '../services/demoFlightSearch';

const processSteps = [
  {
    number: '01',
    title: 'Choose a route and a range of dates',
    description: 'Start with the journey you want to make, then decide how much your departure date can move. More flexibility lets a future service compare a wider date range; it cannot change eligibility or guarantee travel.',
  },
  {
    number: '02',
    title: 'Read the conditions before you act',
    description: 'A future SEATS request would show the airline’s eligibility rules, any applicable terms and the exact next step before you submit it.',
  },
  {
    number: '03',
    title: 'Wait for an airline decision',
    description: 'In a future airline-authorized service, a request could record your interest. It would not reserve inventory, issue a ticket or guarantee a seat.',
  },
];

function dateForOffset(offset: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
}

function dateLabel(criteria: SearchCriteria, offset: number): string {
  if (!criteria.travelDate) return dateForOffset(offset);
  const [year, month, day] = criteria.travelDate.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const selectedOffset = Math.round((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) / 86_400_000);
  date.setDate(date.getDate() + offset - selectedOffset);
  return new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
}

export default function HomePage() {
  const [criteria, setCriteria] = useState<SearchCriteria>({ travelDate: '', flexibility: 'one-day' });
  const [sort, setSort] = useState<DemoFlightSort>('departure');
  const [hasSearched, setHasSearched] = useState(false);
  const flights = useMemo(() => searchDemoFlights(criteria, sort), [criteria, sort]);

  function search(nextCriteria: SearchCriteria) {
    setCriteria(nextCriteria);
    setHasSearched(true);
  }

  return <>
    <main id="main-content">
      <section className="hero container" aria-labelledby="hero-title">
        <div className="hero-copy">
          <span className="eyebrow"><i aria-hidden="true" /> FLEXIBLE TRAVEL, EXPLAINED</span>
          <h1 id="hero-title">Make flexibility<br />part of <em>the plan.</em></h1>
          <p className="hero-intro">SEATS is a standby travel concept for people whose plans can move. Compare a clearly labelled Indore–Delhi demonstration, understand what standby means, and decide whether the idea suits the way you travel.</p>
          <div className="hero-actions"><a className="button-primary" href="#search">Explore the demo route <ArrowRight size={17} /></a><a className="text-link" href="#how-it-works">Understand standby <ArrowDownRight size={16} /></a></div>
          <div className="hero-proof"><ShieldCheck size={17} /><span>No airline feed is connected. This page cannot issue a ticket.</span></div>
        </div>

        <figure className="hero-visual" aria-labelledby="route-art-caption">
          <div className="visual-topline"><span>ROUTE NOTE <b>01</b></span><span className="demo-pill">DEMO</span></div>
          <svg className="route-map" viewBox="0 0 560 350" role="img" aria-labelledby="route-map-title route-map-desc">
            <title id="route-map-title">Indore to Delhi demonstration route</title>
            <desc id="route-map-desc">A decorative route line between airport markers, shown for the SEATS concept only.</desc>
            <path className="map-gridline" d="M40 70H520M40 140H520M40 210H520M40 280H520M110 35V315M230 35V315M350 35V315M470 35V315" />
            <path className="map-route" d="M132 222 C 210 151, 304 152, 414 116" />
            <circle className="map-halo" cx="132" cy="222" r="16" /><circle className="map-halo" cx="414" cy="116" r="16" />
            <circle className="map-node" cx="132" cy="222" r="5" /><circle className="map-node map-node-end" cx="414" cy="116" r="5" />
          </svg>
          <div className="map-label map-label-origin"><span>INDORE</span><strong>IDR</strong><small>Madhya Pradesh</small></div>
          <div className="map-label map-label-destination"><span>DELHI</span><strong>DEL</strong><small>National Capital Region</small></div>
          <figcaption className="visual-route-card" id="route-art-caption"><span className="route-card-icon"><Plane size={18} /></span><div><strong>IDR <i aria-hidden="true">→</i> DEL</strong><span>One example route for this concept</span></div><span className="visual-card-demo">ILLUSTRATIVE</span></figcaption>
          <span className="visual-index" aria-hidden="true">A STUDY IN FLEXIBILITY</span>
        </figure>
      </section>

      <section id="search" className="search-section container" aria-labelledby="search-title">
        <div className="search-heading"><div><span className="section-kicker">THE SEATS ROUTE STUDY</span><h2 id="search-title">Start with Indore to Delhi</h2></div><span className="search-demo-note"><i aria-hidden="true" /> DEMONSTRATION ONLY</span></div>
        <p className="search-intro">Choose a date and how far you could move it. The search filters local examples; it does not check airline schedules or seat availability.</p>
        <SearchForm onSearch={search} initialCriteria={criteria} key={`${criteria.travelDate}-${criteria.flexibility}`} />
      </section>

      <section className="flights-section container" id="flights" aria-labelledby="flights-title">
        <div className="section-heading discovery-heading"><div><span className="section-kicker">LOCAL EXAMPLES, CLEARLY MARKED</span><h2 id="flights-title">A route to <em>consider.</em></h2><p>These sample schedules help explain the discovery experience. They are not airline offers or verified departures.</p></div>
          <label className="sort-control">Sort examples
            <select aria-label="Sort demonstration schedules" value={sort} onChange={(event) => setSort(event.target.value as DemoFlightSort)}>
              <option value="departure">Departure time</option><option value="shortest">Shortest journey</option>
            </select>
          </label>
        </div>

        <div className="route-heading"><div className="route-codes"><strong>{route.from.code}</strong><span aria-hidden="true">→</span><strong>{route.to.code}</strong></div><div className="route-heading-copy"><span>{route.from.city} <i>to</i> {route.to.city}</span><small>{route.from.airport} · {route.to.airport}</small></div><span className="demo-notice">DEMO SCHEDULES</span></div>
        <p className="result-count" role="status" aria-live="polite">{flights.length} illustrative {flights.length === 1 ? 'schedule' : 'schedules'} {hasSearched ? 'match this local search.' : 'in the local route study.'}</p>
        <div className="flight-grid">{flights.length ? flights.map((flight) => <FlightCard key={flight.id} flight={flight} dateLabel={dateLabel(criteria, flight.dateOffset)} />) : <div className="empty-state"><span className="empty-icon"><Info size={19} /></span><div><strong>No local schedule matches those dates</strong><span>Try widening the date range or clearing the date. This result says nothing about real airline availability.</span></div></div>}</div>
        <p className="price-disclaimer"><Info size={16} /> This demonstration does not provide fares, confirmed seats or live availability.</p>
      </section>

      <TravelAssistant />

      <section className="how-section" id="how-it-works" aria-labelledby="how-title"><div className="container process-layout">
        <div className="process-intro"><span className="section-kicker">HOW A STANDBY SERVICE COULD WORK</span><h2 id="how-title">A little flexibility.<br /><em>A lot more clarity.</em></h2><p>Standby is a different way to approach a trip. It asks you to weigh the possibility of a seat against the certainty of a confirmed booking.</p><a className="text-link" href="#standby-rules">Read the traveller notes <ArrowRight size={15} /></a></div>
        <ol className="process-list">{processSteps.map((step) => <li key={step.number}><span className="process-number">{step.number}</span><div><h3>{step.title}</h3><p>{step.description}</p></div></li>)}</ol>
      </div></section>

      <section className="rules-section container" id="standby-rules" aria-labelledby="rules-title">
        <div className="rules-card"><div className="rules-eyebrow"><ShieldCheck size={18} /><span>READ THIS BEFORE RELYING ON STANDBY</span></div>
          <div className="rules-content"><div><span className="section-kicker">WHAT THIS CONCEPT DOES — AND DOES NOT — PROMISE</span><h2 id="rules-title">A request is a<br /><em>possibility, not a seat.</em></h2></div>
            <div className="rules-copy"><p>Only an airline-authorized service could assess eligibility or whether a seat is released. Any request would remain a request until the airline makes its own decision.</p><ul className="rules-list"><li><Check size={16} /> A request is not a reservation, ticket or boarding pass.</li><li><Check size={16} /> Demo examples do not reach an airline.</li><li><Check size={16} /> This concept has no airline inventory or partner access.</li><li><Check size={16} /> No fare or membership fee is being offered here.</li></ul></div>
          </div>
          <div className="expectation-band"><div><strong>If no eligible opportunity appears</strong><span>There is no departure to rely on. A future service would need to explain any expiry, refund and next-step terms before you submitted a request.</span></div><div><strong>What happens in this demonstration</strong><span>Nothing is submitted. Search results are local examples, and no booking or ticket is created.</span></div></div>
        </div>
      </section>

      <section className="account-entry container" id="auth" aria-labelledby="account-title"><div><span className="section-kicker">YOUR SEATS ACCOUNT</span><h2 id="account-title">Keep your travel details in view.</h2><p>When connected to an authorized Supabase project, sign-in can show the requests belonging to your account. Account access does not change demo inventory or confirm a trip.</p></div><AuthPanel /></section>
    </main>
    <SiteFooter />
  </>;
}
