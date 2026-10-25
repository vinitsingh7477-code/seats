import { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, CheckCircle2, Info, ShieldCheck } from 'lucide-react';
import FlightCard from '../components/FlightCard';
import SiteFooter from '../components/SiteFooter';
import AuthPanel from '../features/auth/AuthPanel';
import TravelAssistant from '../features/assistant/TravelAssistant';
import { route } from '../data/flights';
import type { SearchCriteria } from '../schemas/search';
import { searchDemoFlights, type DemoFlightSort } from '../services/demoFlightSearch';
import { HomeProductPanel } from './ProductPages';

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
const demoCriteria: SearchCriteria = { travelDate: '', flexibility: 'one-day' };

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
  const [sort, setSort] = useState<DemoFlightSort>('departure');
  const flights = useMemo(() => searchDemoFlights(demoCriteria, sort), [sort]);

  return <>
    <main id="main-content">
      <section className="hero container" aria-labelledby="hero-title">
        <div className="hero-copy">
          <span className="eyebrow"><i aria-hidden="true" /> TRAVEL, ON YOUR TERMS</span>
          <h1 id="hero-title">Your next move<br />starts <em>here.</em></h1>
          <p className="hero-intro">Explore routes, discover your options, and plan around the way you travel.</p>
          <div className="hero-actions"><a className="button-primary" href="/search">Explore routes <ArrowRight size={17} /></a><a className="text-link" href="/how-it-works">How it works <ArrowDownRight size={16} /></a></div>
        </div>
        <HomeProductPanel />
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
        <p className="result-count" role="status" aria-live="polite">{flights.length} illustrative {flights.length === 1 ? 'schedule' : 'schedules'} in the local route study.</p>
        <div className="flight-grid">{flights.length ? flights.map((flight) => <FlightCard key={flight.id} flight={flight} dateLabel={dateLabel(demoCriteria, flight.dateOffset)} />) : <div className="empty-state"><span className="empty-icon"><Info size={19} /></span><div><strong>No local schedule matches those dates</strong><span>Try widening the date range or clearing the date. This result says nothing about real airline availability.</span></div></div>}</div>
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

      <section className="home-offers container" aria-labelledby="plans-preview-title">
        <div className="home-offers-copy"><span className="section-kicker">A MEMBERSHIP CONCEPT</span><h2 id="plans-preview-title">Built for plans that can move.</h2><p>Explore illustrative membership options for a future standby service. No plan is currently on sale, and no payment is collected.</p><a className="button-primary" href="/plans">Compare plans <ArrowRight size={16} /></a></div>
        <div className="home-offer-points"><p><CheckCircle2 size={18} /><span>Clear route preferences</span></p><p><CheckCircle2 size={18} /><span>Understand the conditions first</span></p><p><CheckCircle2 size={18} /><span>A request never means a confirmed seat</span></p></div>
      </section>

      <section className="home-faq container" aria-labelledby="faq-preview-title">
        <div><span className="section-kicker">GOOD TO KNOW</span><h2 id="faq-preview-title">Standby, in plain terms.</h2><p>Standby is a chance to travel if an airline makes a seat available under its own rules. It is not a substitute for a confirmed ticket when your plans depend on being there.</p><a className="text-link" href="/faq">Read all frequently asked questions <ArrowUpRight size={16} /></a></div>
        <aside className="home-faq-note"><strong>What is connected today?</strong><span>Only local demonstration data. SEATS is not connected to airline inventory, payment processing, or booking systems.</span></aside>
      </section>

      <section className="home-final-cta container" aria-labelledby="final-cta-title"><div><span className="section-kicker">TAKE A LOOK AROUND</span><h2 id="final-cta-title">Start with the route.</h2><p>Explore route options and see how the standby concept is designed to work.</p></div><a className="button-primary" href="/search">Explore routes <ArrowRight size={16} /></a></section>

      <section className="account-entry container" id="auth" aria-labelledby="account-title"><div><span className="section-kicker">YOUR SEATS ACCOUNT</span><h2 id="account-title">Keep your travel details in view.</h2><p>When connected to an authorized Supabase project, sign-in can show the requests belonging to your account. Account access does not change demo inventory or confirm a trip.</p></div><AuthPanel /></section>
    </main>
    <SiteFooter />
  </>;
}
