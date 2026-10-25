import { PlaneTakeoff } from 'lucide-react';
import Brand from './Brand';

export default function SiteFooter() {
  return <footer className="site-footer">
    <div className="container footer-main">
      <div className="footer-brand"><Brand tone="light" /><p>A more flexible way to fly—built around clear choices and honest expectations.</p><div className="footer-principle"><PlaneTakeoff size={19} /><p><strong>Standby is a possibility.</strong><span>It is never a confirmed seat.</span></p></div></div>
      <nav className="footer-links" aria-label="Product links"><strong>Product</strong><a href="/plans">Plans</a><a href="/membership">Membership demo</a><a href="/standby">Standby journey</a><a href="/how-it-works">How it works</a></nav>
      <nav className="footer-links" aria-label="Explore links"><strong>Explore</strong><a href="/search">Route explorer</a><a href="/#search">IDR–DEL route</a><a href="/faq">FAQ</a></nav>
      <nav className="footer-links" aria-label="Support links"><strong>Support</strong><a href="/contact">Contact</a><a href="/login">Sign in</a><a href="/#/dashboard">My account</a></nav>
      <nav className="footer-links" aria-label="Legal links"><strong>Legal drafts</strong><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav>
    </div>
    <div className="container footer-boundary"><span>Prototype experience · no airline inventory or partnership is connected.</span><span>Schedules and plans shown here are illustrative demo content.</span></div>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} SEATS</span><span>Draft privacy and terms information has not been legally reviewed.</span></div>
  </footer>;
}
