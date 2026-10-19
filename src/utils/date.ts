/**
 * Date formatting and range helpers for Molt Coach
 */

import { RangeFilterKey } from '../interface';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Formats ISO string into "28 Jul 2026"
 */
export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const day = d.getDate();
    const month = MONTH_NAMES[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return isoString;
  }
}

/**
 * Formats "started Xd ago" based on startDateISO
 */
export function formatStartedDaysAgo(startDateISO: string): string {
  try {
    const start = new Date(startDateISO).getTime();
    const now = Date.now();
    const diffMs = Math.max(0, now - start);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return `started ${diffDays}d ago`;
  } catch {
    return '';
  }
}

/**
 * Returns ISO string for the `from` query param based on range key
 */
export function getRangeFromISO(range: RangeFilterKey): string | undefined {
  const now = new Date();
  if (range === '7D') {
    const d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d.toISOString();
  }
  if (range === '30D') {
    const d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return d.toISOString();
  }
  if (range === '90D') {
    const d = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    return d.toISOString();
  }
  return undefined; // 'All' sends no from param
}

/**
 * Returns YYYY-MM-DD from Date or ISO string
 */
export function toCalendarDay(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}
