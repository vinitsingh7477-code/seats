import { ArrowRight, Clock3, Plane } from 'lucide-react';
import type { DemoFlight } from '../types/flight';

interface FlightCardProps { flight: DemoFlight; dateLabel: string; }
export default function FlightCard({ flight, dateLabel }: FlightCardProps) {
  return <article className="flight-card">
    <div className="flight-main"><div className="flight-brand-icon"><Plane size={18} /></div><div className="airline"><strong>{flight.airline}</strong><span>{flight.flightNumber} <i>·</i> {flight.cabin}</span></div><span className="demo-pill">DEMO INVENTORY</span></div>
    <div className="flight-route"><div className="airport-time"><strong>{flight.departure}</strong><span>IDR</span></div><div className="route-line"><span>{flight.duration}</span><div><i /><b /><i /></div><span>Non-stop</span></div><div className="airport-time"><strong>{flight.arrival}</strong><span>DEL</span></div></div>
    <div className="flight-meta"><span><Clock3 size={14} /> {dateLabel}</span><span>{flight.seats} indicative seats</span><span>Airline authorisation required</span></div>
    <div className="flight-price"><div><span>Indicative fare</span><strong>₹{flight.fare.toLocaleString('en-IN')}<small> / seat</small></strong></div><button className="select-button" type="button" aria-label={`View demo details for ${flight.flightNumber}`} onClick={() => document.querySelector('#eligibility')?.scrollIntoView({ behavior: 'smooth' })}><ArrowRight size={18} /></button></div>
  </article>;
}
