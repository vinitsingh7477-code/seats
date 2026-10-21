import { z } from 'zod';
import { searchDemoFlights } from '../../services/demoFlightSearch';

export const assistantQuerySchema = z.string().trim()
  .min(2, 'Add a route, date or question so I can help.')
  .max(300, 'Keep your travel note under 300 characters.');

const preferencesSchema = z.object({
  origin: z.string(),
  destination: z.string(),
  travelDate: z.string().date().nullable(),
  flexibilityDays: z.union([z.literal(0), z.literal(1), z.literal(3)]),
  routeSupported: z.boolean(),
  routeAssumed: z.boolean(),
}).strict();

const assistantOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  departure: z.string(),
  arrival: z.string(),
  duration: z.string(),
  dateOffset: z.number().int(),
}).strict();

export const assistantResponseSchema = z.object({
  providerMode: z.literal('demo'),
  preferences: preferencesSchema,
  summary: z.string().min(1).max(500),
  standbyRule: z.string().min(1).max(500),
  options: z.array(assistantOptionSchema).max(20),
}).strict();

export type TravelPreferences = z.infer<typeof preferencesSchema>;
export type DemoAssistantOption = z.infer<typeof assistantOptionSchema>;
export type AssistantResponse = z.infer<typeof assistantResponseSchema>;

export interface TravelAssistantProvider {
  readonly mode: 'demo';
  readonly configured: false;
  respond(query: string): Promise<AssistantResponse>;
}

function getDateFromQuery(query: string, now: Date): string | null {
  const isoDate = query.match(/\b(\d{4}-\d{2}-\d{2})\b/)?.[1];
  if (isoDate && z.string().date().safeParse(isoDate).success) return isoDate;
  const lower = query.toLowerCase();
  const date = new Date(now);
  if (/\btomorrow\b/.test(lower)) date.setDate(date.getDate() + 1);
  else if (!/\btoday\b/.test(lower)) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getFlexibilityDays(query: string): 0 | 1 | 3 {
  if (/±\s*3|within\s+three\s+days|three[- ]day|few days|wide window/i.test(query)) return 3;
  if (/±\s*1|within\s+(?:one|a)\s+day|one[- ]day|flexible|any day|any date|anytime|open dates|date window/i.test(query)) return 1;
  return 0;
}

export function extractTravelPreferences(query: string, now = new Date()): TravelPreferences {
  const normalized = query.toLowerCase();
  const supportedRoute = normalized.match(/\b(?:from\s+)?(indore|idr)\s*(?:to|[-–→])\s*(delhi|del)\b/);
  const unsupportedRoute = normalized.match(/\b(?:from\s+)?([a-z]{3,32})\s+(?:to|for)\s+([a-z]{3,32})\b/);
  const routeSupported = supportedRoute !== null || unsupportedRoute === null;
  const routeAssumed = supportedRoute === null && unsupportedRoute === null;
  const flexibilityDays = getFlexibilityDays(query);

  return preferencesSchema.parse({
    origin: routeSupported ? 'IDR' : unsupportedRoute?.[1] ?? 'Route not supported',
    destination: routeSupported ? 'DEL' : unsupportedRoute?.[2] ?? 'Route not supported',
    travelDate: getDateFromQuery(query, now),
    flexibilityDays,
    routeSupported,
    routeAssumed,
  });
}

export function createDemoAssistantResponse(query: string, now = new Date()): AssistantResponse {
  const validQuery = assistantQuerySchema.parse(query);
  const preferences = extractTravelPreferences(validQuery, now);
  const asksAboutConfirmation = /\b(confirm|confirmed|guarantee|guaranteed|ticket|book(?:ing)?)\b/i.test(validQuery);
  const flexibility = preferences.flexibilityDays === 3 ? 'three-days' : preferences.flexibilityDays === 1 ? 'one-day' : 'exact';
  const schedules = preferences.routeSupported
    ? searchDemoFlights({ travelDate: preferences.travelDate ?? '', flexibility }, 'departure', now)
    : [];
  const options: DemoAssistantOption[] = schedules.map((flight) => ({
    id: flight.id,
    label: flight.label,
    departure: flight.departure,
    arrival: flight.arrival,
    duration: flight.duration,
    dateOffset: flight.dateOffset,
  }));

  let summary = preferences.routeSupported
    ? preferences.routeAssumed
      ? 'You did not name a route, so I used the IDR–DEL route shown in this demonstration. These are local schedule examples; no live service or AI model was queried.'
      : 'These are local timetable examples for Indore to Delhi. They do not come from an airline feed, and no AI model was queried.'
    : 'This demonstration covers Indore (IDR) to Delhi (DEL) only. No schedule or availability was checked for the route you entered.';
  if (asksAboutConfirmation) {
    summary = 'No. A standby request is not a confirmed seat, booking or ticket. An airline would need to authorize the service and make its own eligibility and inventory decision.';
  }

  return assistantResponseSchema.parse({
    providerMode: 'demo',
    preferences,
    summary,
    standbyRule: 'The times below are demonstration data. This assistant cannot contact an airline, check availability, submit a request or confirm travel.',
    options,
  });
}

const demoProvider: TravelAssistantProvider = {
  mode: 'demo',
  configured: false,
  async respond(query) {
    return createDemoAssistantResponse(query);
  },
};

/** A future provider must run in trusted server-side code; this browser build selects only demo mode. */
export function getTravelAssistantProvider(): TravelAssistantProvider {
  return demoProvider;
}
