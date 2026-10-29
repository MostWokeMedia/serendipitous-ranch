import { createFileRoute } from "@tanstack/react-router";

function icsEscape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function stamp(): string {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export const Route = createFileRoute("/api/ical/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { getSql } = await import("@/lib/db");
        const sql = await getSql();
        const spaces = await sql<{ name: string }>`select name from spaces where slug = ${params.slug}`;
        const space = spaces[0];
        if (!space) return new Response("Unknown stay", { status: 404 });
        const rows = await sql<{ id: number; start: string; end: string }>`
          select b.id, b.start_date as start, b.end_date as end
          from blocks b
          join spaces s on s.id = b.space_id
          where s.slug = ${params.slug}
            and b.source <> 'airbnb'
            and b.end_date >= current_date - 1
        `;
        const events = rows
          .map((row) => {
            const start = row.start.replace(/-/g, "");
            const end = row.end.replace(/-/g, "");
            return [
              "BEGIN:VEVENT",
              `UID:block-${row.id}@serendipitous.ranch`,
              `DTSTAMP:${stamp()}`,
              `DTSTART;VALUE=DATE:${start}`,
              `DTEND;VALUE=DATE:${end}`,
              `SUMMARY:${icsEscape(`Held — ${space.name}`)}`,
              "END:VEVENT",
            ].join("\r\n");
          })
          .join("\r\n");
        const body = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Serendipitous Ranch//EN",
          "CALSCALE:GREGORIAN",
          "METHOD:PUBLISH",
          `X-WR-CALNAME:${icsEscape(`Serendipitous Ranch — ${space.name}`)}`,
          events,
          "END:VCALENDAR",
          "",
        ]
          .filter(Boolean)
          .join("\r\n");
        return new Response(body, {
          headers: {
            "content-type": "text/calendar; charset=utf-8",
            "cache-control": "public, max-age=300",
          },
        });
      },
    },
  },
});
