import { describe, expect, it } from 'vitest';
import { searchDemoFlights } from '../services/demoFlightSearch';

describe('local schedule search', () => {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

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
