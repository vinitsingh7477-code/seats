import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUpRight, BadgeCheck, Check, CircleHelp, Compass, MoveRight, ShieldCheck, Sparkles, TicketCheck } from 'lucide-react';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import FlightCard from './components/FlightCard';
import { demoFlights, membershipPrice, route } from './data/flights';

const steps = [
  { number: '01', icon: Compass, title: 'Pick your plan', text: 'Choose a monthly membership that suits how often you like to go.' },
  { number: '02', icon: Sparkles, title: 'Explore standby', text: 'Browse airline-authorised standby options on routes you love.' },
  { number: '03', icon: TicketCheck, title: 'Confirm with care', text: 'Review the terms and fare before requesting an eligible seat.' },
];

function formatDate(date: string, offset: number): string {
  const day = date ? new Date(`${date}T12:00:00`) : new Date();
  day.setDate(day.getDate() + offset);
  return new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(day);
}

export default function App() {
  const [searchDate, setSearchDate] = useState('');
  const flights = useMemo(() => {
    if (!searchDate) return demoFlights;
    const selected = new Date(`${searchDate}T12:00:00`);
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const selectedDay = Date.UTC(selected.getFullYear(), selected.getMonth(), selected.getDate());
    const currentDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const offset = Math.round((selectedDay - currentDay) / 86_400_000);
    return demoFlights.filter((flight) => flight.dateOffset === offset);
  }, [searchDate]);
  return <>
    <Header />
    <main id="top">
      <section className="hero container"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot" /> YOUR NEXT YES IS CLOSER</div><h1>A little more<br /><em>room to roam.</em></h1><p className="hero-intro">A smarter way to take the seat that’s going spare. Explore airline-authorised standby travel with a membership made for flexible plans.</p><div className="hero-actions"><a className="button-primary" href="#search">Explore the demo <MoveRight size={16} /></a><a className="text-link" href="#how-it-works">See how it works <ArrowDown size={14} /></a></div><div className="hero-note"><span className="avatar-stack"><i>✳</i><i>↗</i><i>✦</i></span><span>For the flexible, curious, and<br /><strong>almost-already-packed.</strong></span></div></div>
        <div className="hero-art" aria-label="Illustration of an airplane in a sunlit sky"><div className="sun-orbit orbit-one" /><div className="sun-orbit orbit-two" /><div className="sun" /><div className="cloud cloud-one" /><div className="cloud cloud-two" /><div className="flight-path" /><div className="plane-sticker"><span>✈</span></div><div className="art-label label-top"><span className="label-dot" /> A NEW WAY TO FLY</div><div className="art-label label-bottom"><span>↗</span> plans look good on you</div><div className="art-coordinate">22°43' N<br />75°48' E</div><div className="art-tag">IDR <span>→</span> DEL</div></div>
      </section>

      <section className="search-section container" aria-label="Find demo standby flights"><SearchForm onSearch={setSearchDate} /><div className="search-caption"><span><span className="caption-dot" /> Demo route</span><span>Search is for demonstration only. No live airline inventory.</span></div></section>

      <section className="flights-section container" id="flights"><div className="section-heading"><div><span className="section-kicker">A LITTLE INSPIRATION</span><h2>Good things are <em>taking off.</em></h2></div><a className="text-link desktop-link" href="#eligibility">How standby works <ArrowUpRight size={15} /></a></div><div className="route-heading"><div className="route-codes"><strong>{route.from.code}</strong><span className="route-arrow">→</span><strong>{route.to.code}</strong></div><div><span>{route.from.city} <span className="muted">to</span> {route.to.city}</span><small>{route.from.airport} <span>·</span> {route.to.airport}</small></div><div className="demo-notice"><span /> DEMO · ILLUSTRATIVE PRICES</div></div>
        <div className="flight-grid">{flights.length ? flights.map((flight) => <FlightCard key={flight.id} flight={flight} dateLabel={formatDate(searchDate, searchDate ? 0 : flight.dateOffset)} />) : <div className="empty-state"><CircleHelp size={22} /><div><strong>No demo examples for that date just yet</strong><span>Try another date to see our illustrative IDR–DEL options.</span></div></div>}</div>
        <p className="price-disclaimer"><ShieldCheck size={15} /> Fares shown are illustrative demo values, not offers. Standby access and travel depend on airline authorisation, availability and applicable terms.</p>
      </section>

      <section className="how-section" id="how-it-works"><div className="container"><div className="section-heading"><div><span className="section-kicker">A FEW SIMPLE STEPS</span><h2>More spontaneity.<br /><em>Less guesswork.</em></h2></div><p className="section-side-note">A membership for the maybes that turn into<br />your favourite memories.</p></div><div className="steps-grid">{steps.map(({ number, icon: Icon, title, text }) => <article className="step-card" key={number}><div className="step-top"><span>{number}</span><Icon size={20} strokeWidth={1.7} /></div><h3>{title}</h3><p>{text}</p><div className="step-rule" /></article>)}</div><div className="membership-strip"><div className="member-icon"><BadgeCheck size={22} /></div><div><strong>Made for plans with a little wiggle room.</strong><span>Membership concept from <b>₹{membershipPrice} / month</b> · Demo pricing, not a current offer.</span></div><a href="#search">Explore the route <ArrowUpRight size={15} /></a></div></div></section>

      <section className="eligibility-section container" id="eligibility"><div className="eligibility-card"><div className="eligibility-art"><div className="eligibility-stamp"><Check size={19} /><span>FLEXIBLE<br />BY DESIGN</span></div><div className="eligibility-scribble">the best trips<br />start with <em>maybe</em></div><span className="eligibility-spark">✳</span></div><div className="eligibility-copy"><span className="section-kicker">A NOTE BEFORE YOU GO</span><h2>Standby works<br />a little <em>differently.</em></h2><p>Standby travel is not a confirmed seat. Any real programme would be available only to eligible travellers under an airline’s own rules, subject to its authorisation and seat availability.</p><ul><li><Check size={15} /> Eligibility is set by the participating airline</li><li><Check size={15} /> A standby request never guarantees a seat</li><li><Check size={15} /> Fare and terms are shown before any real booking</li></ul><div className="eligibility-demo"><span className="caption-dot" /> This experience uses demo data. No booking or ticket is created.</div></div></div></section>
    </main>
    <footer className="footer"><div className="container footer-main"><div className="footer-brand"><a className="brand" href="#top"><span className="brand-mark">S</span><span>SEATS<span className="brand-period">.</span></span></a><p>For wherever your<br />maybe takes you.</p></div><div className="footer-links"><div><strong>Explore</strong><a href="#flights">Demo route</a><a href="#how-it-works">How it works</a></div><div><strong>The details</strong><a href="#eligibility">Eligibility</a><a href="mailto:hello@seats.example">Get in touch</a></div></div><div className="footer-signoff">GO WHERE<br /><em>YOU CAN.</em><span>✳</span></div></div><div className="container footer-bottom"><span>© 2026 SEATS · An early concept</span><span>Demo experience · No live inventory or ticketing</span><a href="#top">Back to top ↑</a></div></footer>
  </>;
}
