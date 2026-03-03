/**
 * Unit conversion utilities for DrinkPrime device values.
 *
 * Device raw units:
 *   - lim / disp are in "milli-litres" style raw ints (÷ 1000 = litres)
 *   - val is Unix epoch in seconds
 *
 * Cloud units:
 *   - allowed_litres is already in plain litres (no conversion for display)
 *   - consumed_liters is already in plain litres
 *   - validity is a YYYY-MM-DD string
 */

/** Convert device raw litre value (disp/lim) to plain litres. */
export function rawToLitres(raw: number): number {
  return raw / 1000;
}

/** Convert plain litres to device raw value (for setupParameters). */
export function litresToRaw(litres: number): number {
  return Math.round(litres * 1000);
}

/** Convert Unix epoch (seconds) to Date. */
export function epochToDate(epoch: number): Date {
  return new Date(epoch * 1000);
}

/** Convert Date to Unix epoch seconds (midnight local time). */
export function dateToEpoch(date: Date): number {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(d.getTime() / 1000);
}

/** Parse "YYYY-MM-DD" string to Date. */
export function parseDateString(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Format Date as "YYYY-MM-DD". */
export function formatDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Format Date as human-readable (e.g. "1 Mar 2026"). */
export function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Calculate days remaining from today until a given date. Returns 0 if past. */
export function daysRemaining(date: Date): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const ms = target.getTime() - today.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/** TDS quality label. */
export function tdsQualityLabel(tds: number): string {
  if (tds <= 50) return "Excellent";
  if (tds <= 150) return "Good";
  if (tds <= 300) return "Acceptable";
  return "Poor";
}

/** TDS quality color (tailwind bg class name). */
export function tdsQualityColor(tds: number): string {
  if (tds <= 50) return "#22C55E"; // green-500
  if (tds <= 150) return "#3B82F6"; // blue-500
  if (tds <= 300) return "#F59E0B"; // amber-500
  return "#EF4444"; // red-500
}

/** Validity ring color based on days remaining. */
export function validityColor(days: number): string {
  if (days > 30) return "#22C55E"; // green
  if (days > 7) return "#F59E0B"; // amber
  return "#EF4444"; // red
}
