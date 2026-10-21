import { useState } from 'react';
import { Menu } from 'lucide-react';
import Brand from './Brand';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  return <header className="site-header"><div className="container nav-wrap"><Brand /><nav aria-label="Main navigation" className="desktop-nav"><a href="#how-it-works">How it works</a><a href="#eligibility">Eligibility</a><a href="#flights">Explore flights</a></nav><a className="nav-cta" href="#search">Find a seat <span>↗</span></a><button className="mobile-menu" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)}><Menu size={21} /></button></div>{menuOpen && <nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile navigation"><a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a><a href="#eligibility" onClick={() => setMenuOpen(false)}>Eligibility</a><a href="#flights" onClick={() => setMenuOpen(false)}>Explore flights</a><a href="#search" onClick={() => setMenuOpen(false)}>Find a seat ↗</a></nav>}</header>;
}
