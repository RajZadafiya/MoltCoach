import {
  kgToLb,
  mmToCm,
  formatWeight,
  formatGirthCm,
  formatDelta,
  calculateWeightStats,
} from '../src/utils/conversions';
import { WeightEntry } from '../src/interface';

describe('Unit Conversions & Calculations', () => {
  describe('kgToLb', () => {
    it('converts 86.0 kg to approximately 189.6 lb', () => {
      const lb = kgToLb(86.0);
      expect(lb).toBeCloseTo(189.597, 2);
    });

    it('formats weight in kg and lb correctly', () => {
      expect(formatWeight(86.0, 'kg')).toBe('86.0 kg');
      expect(formatWeight(86.0, 'lb')).toBe('189.6 lb');
    });
  });

  describe('mmToCm', () => {
    it('converts 1012 mm to 101.2 cm per API-CONTRACT', () => {
      expect(mmToCm(1012)).toBe(101.2);
      expect(formatGirthCm(1012)).toBe('101.2 cm');
    });
  });

  describe('formatDelta', () => {
    it('formats positive, negative, and zero deltas with correct sign', () => {
      expect(formatDelta(-6.4, 'kg')).toBe('-6.4 kg');
      expect(formatDelta(1.2, 'kg')).toBe('+1.2 kg');
      expect(formatDelta(0, 'kg')).toBe('0.0 kg');
    });

    it('returns "—" when delta is null (e.g. single entry)', () => {
      expect(formatDelta(null, 'kg')).toBe('—');
    });
  });

  describe('calculateWeightStats', () => {
    it('handles zero entries gracefully', () => {
      const stats = calculateWeightStats([]);
      expect(stats.latestWeightKg).toBeNull();
      expect(stats.totalChangeKg).toBeNull();
      expect(stats.entryDeltas.size).toBe(0);
    });

    it('handles single entry with "—" change (P10 requirement)', () => {
      const entries: WeightEntry[] = [
        {
          id: 'w1',
          clientId: 'c2',
          dateISO: '2026-10-10T03:30:00.000Z',
          weightKg: 65.2,
        },
      ];
      const stats = calculateWeightStats(entries);
      expect(stats.latestWeightKg).toBe(65.2);
      expect(stats.totalChangeKg).toBeNull();
      expect(stats.entryDeltas.get('w1')).toBeNull();
    });

    it('calculates total change and chronological row deltas for multiple entries (P5, P6)', () => {
      // Sorted newest first:
      const entries: WeightEntry[] = [
        {
          id: 'w3',
          clientId: 'c1',
          dateISO: '2026-07-28T09:00:00.000Z',
          weightKg: 86.0,
        },
        {
          id: 'w2',
          clientId: 'c1',
          dateISO: '2026-07-21T09:00:00.000Z',
          weightKg: 86.5,
        },
        {
          id: 'w1',
          clientId: 'c1',
          dateISO: '2026-07-14T09:00:00.000Z',
          weightKg: 92.4,
        },
      ];

      const stats = calculateWeightStats(entries);
      expect(stats.latestWeightKg).toBe(86.0);
      // Total change = newest (86.0) - oldest (92.4) = -6.4
      expect(stats.totalChangeKg).toBeCloseTo(-6.4, 2);

      // w3 vs w2: 86.0 - 86.5 = -0.5
      expect(stats.entryDeltas.get('w3')).toBeCloseTo(-0.5, 2);
      // w2 vs w1: 86.5 - 92.4 = -5.9
      expect(stats.entryDeltas.get('w2')).toBeCloseTo(-5.9, 2);
      // w1 is the oldest, no preceding entry: null
      expect(stats.entryDeltas.get('w1')).toBeNull();
    });
  });
});
