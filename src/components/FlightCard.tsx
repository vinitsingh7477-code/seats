import { ArrowUpRight, Clock3, PlaneTakeoff } from 'lucide-react';
import type { DemoFlight } from '../types/flight';

interface FlightCardProps { flight: DemoFlight; dateLabel: string; }

export default function FlightCard({ flight, dateLabel }: FlightCardProps) {
  const headingId = `schedule-${flight.id}`;

  return <article className="flight-card" aria-labelledby={headingId}>
    <div className="flight-card-top">
      <span className="flight-airline-mark" aria-hidden="true"><PlaneTakeoff size={19} /></span>
      <div className="airline"><strong id={headingId}>{flight.label}</strong><span>Indore to Delhi · example schedule</span></div>
      <span className="demo-pill">DEMO</span>
    </div>

    <div className="flight-route">
      <div className="airport-time"><strong>{flight.departure}</strong><span>IDR · Indore</span></div>
      <div className="route-line"><span>{flight.duration}</span><div aria-hidden="true"><i /><b /><i /></div><span>Sample journey time</span></div>
      <div className="airport-time airport-arrival"><strong>{flight.arrival}</strong><span>DEL · Delhi</span></div>
    </div>

    <div className="flight-meta"><span><Clock3 size={16} /> {dateLabel}</span><span>Availability not connected</span></div>
    <div className="flight-card-bottom">
      <p>Times are illustrative. No airline schedule, availability or fare service is connected.</p>
      <a className="flight-rule-link" href="#standby-rules">Standby conditions <ArrowUpRight size={15} /></a>
    </div>
  </article>;
}
