import { describe, expect, it } from 'vitest';
import { demoRoutes, findDemoRoute, isAirportCode } from '../data/routes';

describe('central demo route configuration', () => {
  it('defines the four requested routes with local schedules', () => {
    expect(demoRoutes.map(({ origin, destination }) => `${origin}-${destination}`)).toEqual([
      'IDR-DEL', 'IDR-BOM', 'IDR-BLR', 'IDR-HYD',
    ]);
    for (const { origin, destination, schedules } of demoRoutes) {
      expect(schedules.length).toBeGreaterThan(0);
      expect(findDemoRoute(origin, destination)?.schedules).toBe(schedules);
    }
  });

  it('supports reversing a configured pair and rejects unconfigured pairs and codes', () => {
    expect(findDemoRoute('BOM', 'IDR')?.origin).toBe('BOM');
    expect(findDemoRoute('BOM', 'IDR')?.schedules[0].id).toBe('bom-idr-1');
    expect(findDemoRoute('BOM', 'DEL')).toBeNull();
    expect(isAirportCode('HYD')).toBe(true);
    expect(isAirportCode('XYZ')).toBe(false);
  });
});
