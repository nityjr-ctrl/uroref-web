import type { CollectionEntry } from 'astro:content';

const MONTH_ORDER: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
};

/** Parses a `"August 2026"` style date into a sortable number. */
function dateKey(date: string): number {
  const [month, year] = date.split(' ');
  return Number(year) * 100 + (MONTH_ORDER[month] ?? 0);
}

/** Deep Dives, newest first. Dates are `"Month YYYY"` strings, so they need
 *  parsing — a plain string comparison puts August below May. */
export function sortDivesByDate(
  dives: CollectionEntry<'deep-dives'>[],
): CollectionEntry<'deep-dives'>[] {
  return [...dives].sort((a, b) => dateKey(b.data.date) - dateKey(a.data.date));
}
