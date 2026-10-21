import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import Brand from './Brand';

const navigation = [
  { href: '#flights', label: 'Explore schedules' },
  { href: '#how-it-works', label: 'How standby works' },
  { href: '#/dashboard', label: 'My account' },
  { href: '#/admin', label: 'Operations' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  }

  return <header className="site-header">
    <div className="container nav-wrap">
      <Brand />
      <nav aria-label="Main navigation" className="desktop-nav">
        {navigation.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
      </nav>
      <a className="nav-cta" href="#search">Explore the demo <ArrowUpRight size={16} /></a>
      <button ref={menuButtonRef} className="mobile-menu" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)}>
        {menuOpen ? <X size={21} /> : <Menu size={21} />}
      </button>
    </div>
    <nav id="mobile-navigation" className={`mobile-navigation${menuOpen ? ' is-open' : ''}`} aria-label="Mobile navigation" aria-hidden={!menuOpen}>
      {navigation.map((item) => <a key={item.href} href={item.href} tabIndex={menuOpen ? 0 : -1} onClick={closeMenu}>{item.label}</a>)}
      <a className="mobile-cta" href="#search" tabIndex={menuOpen ? 0 : -1} onClick={closeMenu}>Explore the demo <ArrowUpRight size={16} /></a>
    </nav>
  </header>;
}
