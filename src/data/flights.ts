import type { DemoFlight } from '../types/flight';

/** Fictional showcase inventory. Never represents a live airline offer. */
export const demoFlights: DemoFlight[] = [
  { id: 'demo-1', airline: 'Demo Airways', flightNumber: 'DM 636', departure: '08:10', arrival: '09:45', duration: '1h 35m', fare: 2499, cabin: 'Economy', seats: 3, dateOffset: 0 },
  { id: 'demo-2', airline: 'Showcase Air', flightNumber: 'SA 216', departure: '13:25', arrival: '14:55', duration: '1h 30m', fare: 2899, cabin: 'Economy', seats: 2, dateOffset: 0 },
  { id: 'demo-3', airline: 'Demo Airways', flightNumber: 'DM 636', departure: '08:10', arrival: '09:45', duration: '1h 35m', fare: 2299, cabin: 'Economy', seats: 4, dateOffset: 1 },
];

export const route = {
  from: { code: 'IDR', city: 'Indore', airport: 'Devi Ahilya Bai Holkar Airport' },
  to: { code: 'DEL', city: 'Delhi', airport: 'Indira Gandhi International' },
};

export const membershipPrice = 499;
