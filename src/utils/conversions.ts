import { WeightEntry, WeightUnit } from '../interface';

export const KG_TO_LB_FACTOR = 2.20462;

/**
 * Converts kilograms to pounds (pure calculation)
 */
export function kgToLb(kg: number): number {
  return kg * KG_TO_LB_FACTOR;
}

/**
 * Converts millimetres to centimetres (pure calculation)
 * 1012 mm -> 101.2 cm
 */
export function mmToCm(mm: number): number {
  return mm / 10;
}

/**
 * Rounds a number to a specific number of decimal places for display purposes.
 * Requirement P8: Round for display, not for storage.
 */
export function roundDisplay(value: number, decimals: number = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Formats a weight value based on the selected unit.
 */
export function formatWeight(weightKg: number, unit: WeightUnit): string {
  if (unit === 'lb') {
    const lb = kgToLb(weightKg);
    return `${roundDisplay(lb, 1).toFixed(1)} lb`;
  }
  return `${roundDisplay(weightKg, 1).toFixed(1)} kg`;
}

/**
 * Formats girth from mm to cm for display.
 * 1012 mm -> 101.2 cm
 */
export function formatGirthCm(mm: number): string {
  const cm = mmToCm(mm);
  return `${roundDisplay(cm, 1).toFixed(1)} cm`;
}

/**
 * Formats delta value with a sign (+ / -) or "—" if null.
 * e.g. -6.4 kg or +1.2 kg or 0.0 kg
 */
export function formatDelta(
  deltaKg: number | null,
  unit: WeightUnit = 'kg',
): string {
  if (deltaKg === null) {
    return '—';
  }

  const value = unit === 'lb' ? kgToLb(deltaKg) : deltaKg;
  const rounded = roundDisplay(value, 1);
  const formatted = Math.abs(rounded).toFixed(1);

  if (rounded > 0) {
    return `+${formatted} ${unit}`;
  }
  if (rounded < 0) {
    return `-${formatted} ${unit}`;
  }
  return `0.0 ${unit}`;
}

/**
 * Formats girth delta value in cm with sign (+ / -) or "—" if null.
 */
export function formatGirthDeltaCm(deltaMm: number | null): string {
  if (deltaMm === null) {
    return '—';
  }

  const deltaCm = mmToCm(deltaMm);
  const rounded = roundDisplay(deltaCm, 1);
  const formatted = Math.abs(rounded).toFixed(1);

  if (rounded > 0) {
    return `+${formatted} cm`;
  }
  if (rounded < 0) {
    return `-${formatted} cm`;
  }
  return `0.0 cm`;
}

export interface WeightStats {
  latestWeightKg: number | null;
  totalChangeKg: number | null;
  /** Each entry mapped to its delta compared to the immediately preceding chronological entry */
  entryDeltas: Map<string, number | null>;
}

/**
 * Calculates statistics for sorted weight entries (assumes sorted newest first).
 * - Total change = latest (newest) - oldest
 * - For a single entry, total change is null (shows "—", per requirement P10)
 * - Row delta = current entry - entry before it chronologically
 */
export function calculateWeightStats(
  sortedNewestFirst: WeightEntry[],
): WeightStats {
  if (sortedNewestFirst.length === 0) {
    return {
      latestWeightKg: null,
      totalChangeKg: null,
      entryDeltas: new Map(),
    };
  }

  const latestWeightKg = sortedNewestFirst[0].weightKg;
  const entryDeltas = new Map<string, number | null>();

  if (sortedNewestFirst.length === 1) {
    entryDeltas.set(sortedNewestFirst[0].id, null);
    return {
      latestWeightKg,
      totalChangeKg: null, // P10: Single entry has no change, show "—"
      entryDeltas,
    };
  }

  const oldest = sortedNewestFirst[sortedNewestFirst.length - 1];
  const newest = sortedNewestFirst[0];
  const totalChangeKg = newest.weightKg - oldest.weightKg;

  // Calculate delta for each row:
  // Since array is newest first (index 0 is newest, index N is oldest):
  // The entry chronologically BEFORE index i is index i + 1.
  for (let i = 0; i < sortedNewestFirst.length; i++) {
    const current = sortedNewestFirst[i];
    if (i < sortedNewestFirst.length - 1) {
      const previousChronological = sortedNewestFirst[i + 1];
      const delta = current.weightKg - previousChronological.weightKg;
      entryDeltas.set(current.id, delta);
    } else {
      // Oldest entry has no prior entry in the list
      entryDeltas.set(current.id, null);
    }
  }

  return {
    latestWeightKg,
    totalChangeKg,
    entryDeltas,
  };
}
