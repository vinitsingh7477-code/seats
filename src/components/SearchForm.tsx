import { useState, type FormEvent } from 'react';
import { ArrowRight, CalendarDays, MapPin, Search } from 'lucide-react';
import { searchCriteriaSchema, type SearchCriteria } from '../schemas/search';

interface SearchFormProps {
  onSearch: (criteria: SearchCriteria) => void;
  initialCriteria?: SearchCriteria;
}

function todayAsIsoDate(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

export default function SearchForm({ onSearch, initialCriteria }: SearchFormProps) {
  const [travelDate, setTravelDate] = useState(initialCriteria?.travelDate ?? '');
  const [flexibility, setFlexibility] = useState<SearchCriteria['flexibility']>(initialCriteria?.flexibility ?? 'one-day');
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = searchCriteriaSchema.safeParse({ travelDate, flexibility });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Review the date and flexibility options.');
      return;
    }
    setError(null);
    onSearch(parsed.data);
  }

  return <>
    <form className="search-form" id="search-form" onSubmit={submit} aria-label="Search the IDR to DEL demo route">
      <div className="search-route" aria-label="Demonstration route">
        <div className="route-field"><span className="field-label">FROM</span><span className="field-value"><MapPin size={16} /> Indore <small>IDR</small></span></div>
        <ArrowRight className="route-arrow" size={17} aria-hidden="true" />
        <div className="route-field"><span className="field-label">TO</span><span className="field-value"><MapPin size={16} /> Delhi <small>DEL</small></span></div>
      </div>

      <label className="search-control">
        <span className="search-control-label"><CalendarDays size={15} /> Travel date <span>Optional</span></span>
        <input aria-label="Travel date" type="date" min={todayAsIsoDate()} value={travelDate} onChange={(event) => setTravelDate(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? 'search-error' : 'search-date-help'} />
        <small id="search-date-help">Leave blank to see every local schedule.</small>
      </label>

      <label className="search-control">
        <span className="search-control-label">Date flexibility</span>
        <select aria-label="Date flexibility" value={flexibility} onChange={(event) => setFlexibility(event.target.value as SearchCriteria['flexibility'])}>
          <option value="exact">Exact date</option>
          <option value="one-day">Within one day</option>
          <option value="three-days">Within three days</option>
        </select>
        <small>Applied only when a date is selected.</small>
      </label>

      <button className="search-button" type="submit"><Search size={17} /><span>Find demo schedules</span></button>
    </form>
    {error && <p className="form-error" id="search-error" role="alert">{error}</p>}
  </>;
}
