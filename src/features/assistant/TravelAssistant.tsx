import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Bot, CalendarDays, MapPin, RotateCw, Sparkles } from 'lucide-react';
import { assistantQuerySchema, assistantResponseSchema, getTravelAssistantProvider, type AssistantResponse } from './assistantService';

const suggestedPrompts = [
  'Show a flexible date range from Indore to Delhi',
  'What does standby mean for tomorrow?',
  'Does a standby request confirm a seat?',
];

function formatDate(date: string | null, offset: number): string {
  const result = date ? new Date(`${date}T12:00:00`) : new Date();
  if (!date) result.setHours(12, 0, 0, 0);
  result.setDate(result.getDate() + offset);
  return new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(result);
}

function flexibilityLabel(days: number): string {
  if (days === 3) return 'Within three days';
  if (days === 1) return 'Within one day';
  return 'No date range specified';
}

export default function TravelAssistant() {
  const provider = getTravelAssistantProvider();
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  async function ask(prompt: string) {
    setError(null);
    const validQuery = assistantQuerySchema.safeParse(prompt);
    if (!validQuery.success) {
      setError(validQuery.error.issues[0]?.message ?? 'Add a route, date or question.');
      return;
    }
    setQuery(validQuery.data);
    setWorking(true);
    try {
      const result = await provider.respond(validQuery.data);
      setResponse(assistantResponseSchema.parse(result));
    } catch (assistantError) {
      setError(assistantError instanceof Error
        ? `I could not prepare those suggestions. Your note is still here. ${assistantError.message}`
        : 'I could not prepare those suggestions. Your note is still here; try again.');
    } finally {
      setWorking(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(query);
  }

  return <section className="assistant-section container" aria-labelledby="assistant-title">
    <div className="assistant-card">
      <div className="assistant-heading">
        <div className="assistant-title-group"><span className="assistant-icon"><Sparkles size={19} /></span><div><span className="section-kicker">A QUIETER WAY TO PLAN</span><h2 id="assistant-title">Ask SEATS</h2></div></div>
        <span className="assistant-mode"><span aria-hidden="true" /> LOCAL DEMO · NO MODEL CONNECTED</span>
      </div>
      <p className="assistant-intro">Describe a route, a date or how much room your plans have. This local demonstration recognizes a few travel preferences and shows sample schedules; it does not call an AI service, check an airline or submit a request.</p>
      <div className="assistant-suggestions" role="group" aria-label="Example travel questions">
        {suggestedPrompts.map((prompt) => <button key={prompt} type="button" onClick={() => void ask(prompt)}>{prompt}</button>)}
      </div>
      <form className="assistant-input" onSubmit={submit}>
        <label className="visually-hidden" htmlFor="assistant-query">Describe your route, date or travel question</label>
        <textarea id="assistant-query" rows={2} value={query} onChange={(event) => setQuery(event.target.value)} maxLength={300} placeholder="For example: Indore to Delhi, any day this week" />
        <button type="submit" aria-label="Show local demo suggestions" disabled={working}><ArrowUpRight size={18} /></button>
      </form>
      {working && <p className="assistant-loading" role="status"><span className="loading-dot" /> Preparing local suggestions…</p>}
      {error && <div className="assistant-error" role="alert"><p>{error}</p><button type="button" onClick={() => void ask(query)} disabled={working}><RotateCw size={14} /> Try again</button></div>}
      {response && <div className="assistant-response" aria-live="polite">
        <div className="assistant-answer"><span className="assistant-answer-icon"><Bot size={18} /></span><div><span className="assistant-mode-label">DEMO RESPONSE · NO LIVE SERVICE</span><p>{response.summary}</p></div></div>
        <div className="preference-row" aria-label="Travel details understood from your note"><span><MapPin size={15} /> {response.preferences.origin} → {response.preferences.destination}{response.preferences.routeAssumed ? ' · route used for this demo' : ''}</span><span><CalendarDays size={15} /> {response.preferences.travelDate ?? 'No date specified'}</span><span>{flexibilityLabel(response.preferences.flexibilityDays)}</span></div>
        <div className="assistant-options">
          <div className="assistant-options-heading"><strong>Local schedule examples</strong><span>DEMO · NOT AIRLINE AVAILABILITY</span></div>
          {response.options.length ? response.options.map((option) => <article className="assistant-option" key={option.id}>
            <span className="demo-pill">DEMO</span><div className="assistant-option-route"><strong>{option.departure}</strong><span>{option.label} · {formatDate(response.preferences.travelDate, option.dateOffset)}</span><strong>{option.arrival}</strong></div>
            <div className="assistant-option-note"><span>Availability</span><strong>Not connected</strong></div>
          </article>) : <p className="assistant-empty">No local schedule matches that date and range. Widen the date window or try the IDR–DEL route. This does not indicate real-world availability.</p>}
        </div>
        <p className="assistant-rule">{response.standbyRule}</p>
      </div>}
    </div>
  </section>;
}
