import { searchCriteriaSchema, type SearchCriteria } from '../schemas/search';
import { demoFlights } from '../data/flights';
import type { DemoFlight } from '../types/flight';

export type DemoFlightSort = 'departure' | 'shortest';

function dateOffsetFor(date: string, now: Date): number {
  const [year, month, day] = date.split('-').map(Number);
  const today = new Date(now);
  const currentDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((Date.UTC(year, month - 1, day) - currentDay) / 86_400_000);
}

export function searchDemoFlights(
  input: SearchCriteria,
  sort: DemoFlightSort = 'departure',
  now = new Date(),
): DemoFlight[] {
  const criteria = searchCriteriaSchema.parse(input);
  const windowDays = criteria.flexibility === 'three-days' ? 3 : criteria.flexibility === 'one-day' ? 1 : 0;
  const centerOffset = criteria.travelDate ? dateOffsetFor(criteria.travelDate, now) : null;
  const results = demoFlights.filter((flight) => centerOffset === null
    || Math.abs(flight.dateOffset - centerOffset) <= windowDays);

  return [...results].sort((first, second) => sort === 'shortest'
    ? first.durationMinutes - second.durationMinutes || first.departure.localeCompare(second.departure)
    : first.departure.localeCompare(second.departure));
}
