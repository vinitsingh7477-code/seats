import { ArrowUpRight, PlaneTakeoff } from 'lucide-react';
import Brand from './Brand';

export default function SiteFooter() {
  return <footer className="site-footer">
    <div className="container footer-main">
      <div className="footer-brand"><Brand /><p>Make room for a more flexible way to travel.</p></div>
      <div className="footer-principle"><PlaneTakeoff size={20} /><p><strong>Designed around the decision.</strong><span>Standby can create an option. It cannot promise a seat.</span></p></div>
      <nav className="footer-links" aria-label="Footer navigation">
        <a href="#flights">Explore demo schedules</a>
        <a href="#standby-rules">Standby, explained</a>
        <a href="#/dashboard">Customer account <ArrowUpRight size={15} /></a>
      </nav>
    </div>
    <div className="container footer-boundary"><span>SEATS is an early product concept. No airline inventory is connected.</span><span>DEMO DATA · NO FARES · NO BOOKINGS OR TICKETS</span></div>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} SEATS</span><span>Support details will appear here when an operating service is established.</span></div>
  </footer>;
}
