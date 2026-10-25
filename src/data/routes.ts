export const airports = {
  IDR: { code: 'IDR', city: 'Indore', name: 'Devi Ahilya Bai Holkar Airport', region: 'Madhya Pradesh' },
  DEL: { code: 'DEL', city: 'Delhi', name: 'Indira Gandhi International Airport', region: 'National Capital Region' },
  BOM: { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj International Airport', region: 'Maharashtra' },
  BLR: { code: 'BLR', city: 'Bengaluru', name: 'Kempegowda International Airport', region: 'Karnataka' },
  HYD: { code: 'HYD', city: 'Hyderabad', name: 'Rajiv Gandhi International Airport', region: 'Telangana' },
} as const;

export type AirportCode = keyof typeof airports;
export type DemoSchedule = { id: string; departure: string; arrival: string; duration: string };
export type RouteDefinition = { origin: AirportCode; destination: AirportCode; schedules: readonly DemoSchedule[]; reverseSchedules: readonly DemoSchedule[] };

/** Supported route pairs and their local illustrative schedules. These are not airline inventory. */
export const demoRoutes = [
  { origin: 'IDR', destination: 'DEL', schedules: [{ id: 'idr-del-1', departure: '08:10', arrival: '09:45', duration: '1h 35m' }, { id: 'idr-del-2', departure: '13:25', arrival: '14:55', duration: '1h 30m' }], reverseSchedules: [{ id: 'del-idr-1', departure: '10:20', arrival: '12:00', duration: '1h 40m' }] },
  { origin: 'IDR', destination: 'BOM', schedules: [{ id: 'idr-bom-1', departure: '09:15', arrival: '10:45', duration: '1h 30m' }, { id: 'idr-bom-2', departure: '17:20', arrival: '18:55', duration: '1h 35m' }], reverseSchedules: [{ id: 'bom-idr-1', departure: '11:20', arrival: '12:55', duration: '1h 35m' }] },
  { origin: 'IDR', destination: 'BLR', schedules: [{ id: 'idr-blr-1', departure: '07:30', arrival: '09:35', duration: '2h 05m' }], reverseSchedules: [{ id: 'blr-idr-1', departure: '14:20', arrival: '16:25', duration: '2h 05m' }] },
  { origin: 'IDR', destination: 'HYD', schedules: [{ id: 'idr-hyd-1', departure: '12:10', arrival: '13:35', duration: '1h 25m' }], reverseSchedules: [{ id: 'hyd-idr-1', departure: '16:10', arrival: '17:35', duration: '1h 25m' }] },
] as const satisfies readonly RouteDefinition[];

export function isAirportCode(value: string | null | undefined): value is AirportCode {
  return value !== null && value !== undefined && Object.prototype.hasOwnProperty.call(airports, value);
}

export function getAirport(value: string) {
  return isAirportCode(value) ? airports[value] : null;
}

/** The configured city pairs are explorable in either direction; metadata stays in the central route list. */
export function findDemoRoute(origin: string, destination: string) {
  const match = demoRoutes.find((route) =>
    (route.origin === origin && route.destination === destination)
    || (route.origin === destination && route.destination === origin));
  if (!match) return null;
  const isForward = match.origin === origin && match.destination === destination;
  return { route: match, origin: origin as AirportCode, destination: destination as AirportCode, schedules: isForward ? match.schedules : match.reverseSchedules };
}

export const airportOptions = Object.values(airports);
