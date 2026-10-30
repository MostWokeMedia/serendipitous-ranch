// Set to true to show nightly rates, totals and rate labels on the public site again.
export const SHOW_PRICES = false;

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export function nightCount(start: string, endExclusive: string): number {
  const [ys, ms, ds] = start.split("-").map(Number);
  const [ye, me, de] = endExclusive.split("-").map(Number);
  return Math.round((Date.UTC(ye, me - 1, de) - Date.UTC(ys, ms - 1, ds)) / 86400000);
}

export function pretty(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${SHORT[m - 1]} ${d}, ${y}`;
}

export function formatHold(start: string, endExclusive: string, kind: "nights" | "days"): string {
  const last = addDays(endExclusive, -1);
  if (kind === "days") {
    if (last === start) return pretty(start);
    return `${pretty(start)} – ${pretty(last)}`;
  }
  const nights = nightCount(start, endExclusive);
  const word = nights === 1 ? "night" : "nights";
  return `${pretty(start)} arrival · ${pretty(endExclusive)} departure · ${nights} ${word}`;
}

export function rangesOverlap(
  blocks: { start: string; end: string }[],
  start: string,
  endExclusive: string,
): boolean {
  return blocks.some((b) => b.start < endExclusive && b.end > start);
}

export function weekdayIndex(year: number, month: number): number {
  return new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function shiftMonth(cursor: string, delta: number): string {
  const [y, m] = cursor.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1 + delta, 1));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  return `${yy}-${mm}`;
}

export function isWeekendNight(iso: string): boolean {
  const [y, m, d] = iso.split("-").map(Number);
  const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return day === 5 || day === 6;
}

export function money(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

export function nightRate(iso: string, weekday: number, weekend: number): number {
  return isWeekendNight(iso) ? weekend : weekday;
}

export function stayTotal(start: string, endExclusive: string, weekday: number, weekend: number): number {
  let total = 0;
  for (let day = start; day < endExclusive; day = addDays(day, 1)) {
    total += nightRate(day, weekday, weekend);
  }
  return total;
}
