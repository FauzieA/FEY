/** Shared date helpers. All persisted dates are ISO day strings (YYYY-MM-DD). */

export function toISODate(date: Date | string | number = new Date()): string {
  const d = date instanceof Date ? date : new Date(date);
  const offsetMs = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 10);
}

export const today = () => toISODate();

export function addDays(date: string | Date, days: number): string {
  const d = typeof date === "string" ? new Date(`${date}T00:00:00`) : new Date(date);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function daysBetween(from: string | Date, to: string | Date = new Date()): number {
  const a = typeof from === "string" ? new Date(`${from}T00:00:00`) : new Date(from);
  const b = typeof to === "string" ? new Date(`${to}T00:00:00`) : new Date(to);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** Monday-based start of the week containing `date`. */
export function startOfWeek(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? new Date(`${date}T00:00:00`) : new Date(date);
  const dayOfWeek = d.getDay() || 7;
  d.setDate(d.getDate() - dayOfWeek + 1);
  return toISODate(d);
}

/** The 7 ISO dates of the week containing `date`, Monday first. */
export function weekDates(date: Date | string = new Date()): string[] {
  const monday = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** The last `count` ISO dates ending today, oldest first. */
export function lastNDays(count: number): string[] {
  return Array.from({ length: count }, (_, i) => addDays(today(), i - count + 1));
}

export function monthKey(date: string | Date = new Date()): string {
  return toISODate(date).slice(0, 7);
}

export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(`${date.slice(0, 10)}T00:00:00`) : new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function formatShortDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(`${date.slice(0, 10)}T00:00:00`) : new Date(date);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function weekdayLabel(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: "short" });
}

export function relativeDay(date: string): string {
  const diff = daysBetween(date);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff === -1) return "Tomorrow";
  if (diff > 0) return `${diff} days ago`;
  return `in ${Math.abs(diff)} days`;
}

/**
 * Length of the current consecutive run of dates ending today (or yesterday,
 * so a streak is not broken until a full day is missed).
 */
export function currentStreak(dates: Iterable<string>): number {
  const set = new Set([...dates].map((d) => d.slice(0, 10)));
  if (set.size === 0) return 0;

  let cursor = today();
  if (!set.has(cursor)) {
    cursor = addDays(cursor, -1);
    if (!set.has(cursor)) return 0;
  }

  let streak = 0;
  while (set.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Longest consecutive run of days present in `dates`. */
export function longestStreak(dates: Iterable<string>): number {
  const sorted = [...new Set([...dates].map((d) => d.slice(0, 10)))].sort();
  let best = 0;
  let run = 0;
  let previous: string | null = null;

  for (const date of sorted) {
    run = previous && daysBetween(previous, date) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    previous = date;
  }
  return best;
}
