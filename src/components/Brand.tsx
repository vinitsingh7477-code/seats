type BrandVariant = 'icon' | 'horizontal' | 'stacked';
type BrandTone = 'light' | 'dark';

export default function Brand({ variant = 'horizontal', tone = 'light', tagline = false }: { variant?: BrandVariant; tone?: BrandTone; tagline?: boolean }) {
  return <a className={`brand brand-${variant} brand-${tone}`} href="/" aria-label="SEATS home">
    <svg className="brand-symbol" viewBox="0 0 64 64" width="44" height="44" aria-hidden="true" focusable="false">
      <path d="M43.9 12.1C40.6 8.9 36.2 7.2 30.7 7.2c-10.4 0-18 5.8-18 14 0 6.2 4.1 9.8 13.6 12.5l8 2.3c5.4 1.6 7.8 3.4 7.8 6.9 0 4.6-4.8 7.8-11.6 7.8-6.1 0-10.8-2.4-13.5-6.7l-6.7 4.1c3.9 6.1 11 9.6 20 9.6 11.6 0 19.9-6 19.9-14.9 0-6.6-4.2-10.5-13.9-13.3l-7.7-2.2c-5.6-1.6-7.8-3.2-7.8-6.3 0-3.8 4.1-6.7 9.8-6.7 4 0 7.2 1.2 9.8 3.8l3.5-6Z" fill="currentColor" />
      <path d="M39.4 48.2c5.7-.8 10.2-3.6 13.7-8.1" stroke="var(--brand-signal)" strokeWidth="4" strokeLinecap="round" />
      <path d="m49.2 39.3 4.8.7-.3 4.8" stroke="var(--brand-signal)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    {variant !== 'icon' && <span className="brand-copy"><span className="brand-wordmark">SEATS</span>{tagline && <span className="brand-tagline">A more flexible way to fly.</span>}</span>}
  </a>;
}
