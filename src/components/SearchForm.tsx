import { useState, type FormEvent } from 'react';
import { ArrowDownUp, CalendarDays, MapPin, Search } from 'lucide-react';

interface SearchFormProps { onSearch: (date: string) => void; }
export default function SearchForm({ onSearch }: SearchFormProps) {
  const [date, setDate] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); onSearch(date); };
  return <form className="search-form" id="search" onSubmit={submit} aria-label="Search demo standby flights">
    <div className="search-field" role="group" aria-label="Origin: Indore, IDR"><span className="field-icon"><MapPin size={18} /></span><span className="field-copy"><span className="field-label">From</span><span className="field-value">Indore <small>IDR</small></span></span></div>
    <span className="swap-icon" aria-hidden="true"><ArrowDownUp size={16} /></span>
    <div className="search-field" role="group" aria-label="Destination: Delhi, DEL"><span className="field-icon"><MapPin size={18} /></span><span className="field-copy"><span className="field-label">To</span><span className="field-value">Delhi <small>DEL</small></span></span></div>
    <span className="search-divider" />
    <label className="search-field date-field"><span className="field-icon"><CalendarDays size={18} /></span><span className="field-copy"><span className="field-label">Travel date</span><input aria-label="Travel date" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></span></label>
    <button className="search-button" type="submit"><Search size={17} /><span>Search seats</span></button>
  </form>;
}
