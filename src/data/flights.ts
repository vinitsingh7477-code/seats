import type { DemoFlight } from '../types/flight';

/** Local schedule examples for the IDR–DEL concept route. Never airline inventory. */
export const demoFlights: DemoFlight[] = [
  { id: 'demo-1', label: 'Sample schedule A', departure: '08:10', arrival: '09:45', duration: '1h 35m', durationMinutes: 95, dateOffset: 0 },
  { id: 'demo-2', label: 'Sample schedule B', departure: '13:25', arrival: '14:55', duration: '1h 30m', durationMinutes: 90, dateOffset: 0 },
  { id: 'demo-3', label: 'Sample schedule C', departure: '08:10', arrival: '09:45', duration: '1h 35m', durationMinutes: 95, dateOffset: 1 },
];

export const route = {
  from: { code: 'IDR', city: 'Indore', airport: 'Devi Ahilya Bai Holkar Airport' },
  to: { code: 'DEL', city: 'Delhi', airport: 'Indira Gandhi International' },
};
