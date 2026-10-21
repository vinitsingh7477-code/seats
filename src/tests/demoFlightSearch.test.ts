import { describe, expect, it } from 'vitest';
import { searchDemoFlights } from '../services/demoFlightSearch';

describe('local schedule search', () => {
  const today = new Date(2026, 9, 22, 12);
  const todayIso = '2026-10-22';

  it('applies exact and flexible date windows only to local demo schedules', () => {
    expect(searchDemoFlights({ travelDate: todayIso, flexibility: 'exact' }, 'departure', today).map((flight) => flight.id))
      .toEqual(['demo-1', 'demo-2']);
    expect(searchDemoFlights({ travelDate: todayIso, flexibility: 'one-day' }, 'departure', today)).toHaveLength(3);
    expect(searchDemoFlights({ travelDate: '', flexibility: 'exact' }, 'departure', today)).toHaveLength(3);
  });

  it('sorts by journey length without changing the source fixture order', () => {
    expect(searchDemoFlights({ travelDate: '', flexibility: 'one-day' }, 'shortest', today).map((flight) => flight.id))
      .toEqual(['demo-2', 'demo-1', 'demo-3']);
    expect(searchDemoFlights({ travelDate: '', flexibility: 'one-day' }, 'departure', today).map((flight) => flight.id))
      .toEqual(['demo-1', 'demo-3', 'demo-2']);
  });
});
