import { useState } from "react";
import {
  MONTHS,
  addDays,
  daysInMonth,
  isWeekendNight,
  SHOW_PRICES,
  money,
  rangesOverlap,
  shiftMonth,
  utcToday,
  weekdayIndex,
} from "@/lib/ranch/dates";

type Span = { start: string; end: string };

export function RangeCalendar({
  blocks,
  start,
  end,
  onChange,
  weekdayRate,
  weekendRate,
}: {
  blocks: Span[];
  start: string | null;
  end: string | null;
  onChange: (start: string, end: string | null) => void;
  weekdayRate: number | null;
  weekendRate: number | null;
}) {
  const [cursor, setCursor] = useState(() => utcToday().slice(0, 7));
  const [year, month] = cursor.split("-").map(Number);
  const lead = weekdayIndex(year, month);
  const count = daysInMonth(year, month);
  const earliest = addDays(utcToday(), -1);
  const weekPrice = weekdayRate;
  const weekendPrice = weekendRate;
  const priced = SHOW_PRICES && weekPrice != null && weekendPrice != null;
  const cells: (string | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: count }, (_, i) => {
      const day = String(i + 1).padStart(2, "0");
      const mm = String(month).padStart(2, "0");
      return `${year}-${mm}-${day}`;
    }),
  ];

  function blocked(day: string) {
    return rangesOverlap(blocks, day, addDays(day, 1));
  }

  function inSelection(day: string) {
    if (!start) return false;
    if (!end) return day === start;
    return day >= start && day < end;
  }

  function rate(day: string): number | null {
    if (!priced || weekPrice == null || weekendPrice == null) return null;
    return isWeekendNight(day) ? weekendPrice : weekPrice;
  }

  function pick(day: string) {
    if (day < earliest || blocked(day)) return;
    if (!start || end) {
      onChange(day, null);
      return;
    }
    if (day <= start) {
      onChange(day, null);
      return;
    }
    if (rangesOverlap(blocks, start, day)) {
      onChange(day, null);
      return;
    }
    onChange(start, day);
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <button type="button" className="btn-line px-3" onClick={() => setCursor(shiftMonth(cursor, -1))} aria-label="Previous month">
          Prev
        </button>
        <p className="font-display text-xl">
          {MONTHS[month - 1]} {year}
        </p>
        <button type="button" className="btn-line px-3" onClick={() => setCursor(shiftMonth(cursor, 1))} aria-label="Next month">
          Next
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted" aria-hidden>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Nightly rates">
        {cells.map((day, i) => {
          if (!day) return <span key={`e${i}`} />;
          const off = blocked(day) || day < earliest;
          const on = inSelection(day);
          const amount = off ? null : rate(day);
          const label = off
            ? `${day}, unavailable`
            : amount != null
              ? `${day}, ${money(amount)}`
              : day;
          return (
            <button
              key={day}
              type="button"
              disabled={off}
              onClick={() => pick(day)}
              aria-pressed={on}
              aria-label={label}
              className={`flex min-h-14 flex-col items-center justify-center rounded-md px-0.5 py-1 leading-none ${
                on ? "bg-accent text-bg" : off ? "text-muted/40" : "text-fg hover:bg-bg"
              }`}
            >
              <span className="text-sm tabular-nums">{Number(day.slice(-2))}</span>
              {amount != null ? (
                <span className={`mt-1 text-xs tabular-nums ${on ? "text-bg" : "text-accent"}`}>{money(amount)}</span>
              ) : off && day >= earliest ? (
                <span className="mt-1 text-xs">Held</span>
              ) : (
                <span className="mt-1 text-xs">&nbsp;</span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-muted">
        {priced
          ? `Sun–Thu ${money(weekPrice)} · Fri–Sat ${money(weekendPrice)}. The number is the night that starts that day. Tap arrival, then the morning you leave.`
          : "Tap arrival, then the morning you leave. Held nights are marked."}
      </p>
    </div>
  );
}
