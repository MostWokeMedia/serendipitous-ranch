import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { addDays } from "./dates";
import { isPageId, panelDef, panelDefs, type PageId, type Panel, type PanelFields } from "./panels";

export type Space = {
  id: number;
  slug: string;
  name: string;
  kind: "stay" | "venue";
  summary: string;
  sleeps: number | null;
  sqft: number | null;
  image: string | null;
  active: boolean;
  inBuyout: boolean;
  sort: number;
  weekdayRate: number | null;
  weekendRate: number | null;
};

export type Span = { slug: string; start: string; end: string };

export type Inventory = {
  spaces: Space[];
  blocks: Span[];
  contactEmail: string;
  panels: Panel[];
};

export type HoldGroup = {
  refCode: string;
  start: string;
  end: string;
  source: string;
  purpose: string;
  partySize: number | null;
  names: string[];
};

export type VendorNote = {
  id: number;
  refCode: string;
  trade: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  area: string;
  website: string | null;
  instagram: string;
  offering: string;
  serves: string;
  years: number | null;
  insured: boolean;
  createdOn: string;
};

export type Inquiry = {
  id: number;
  refCode: string;
  kind: string;
  contactName: string;
  email: string;
  phone: string;
  subject: string;
  start: string | null;
  end: string | null;
  partySize: number | null;
  note: string;
  createdOn: string;
};

export type Desk = Inventory & {
  holds: HoldGroup[];
  vendors: VendorNote[];
  inquiries: Inquiry[];
};

export type OkRef = { ok: true; refCode: string; names: string[]; start: string; end: string };
export type Fail = { ok: false; error: string };

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const holdSchema = z.object({
  mode: z.enum(["stay", "whole", "venues", "venues-and-stays"]),
  slug: z.string().max(60).optional(),
  start: dateStr,
  end: dateStr,
  partySize: z.number().int().min(1).max(500),
  purpose: z.enum(["stay", "wedding", "corporate", "retreat", "other"]),
});

const spaceSchema = z.object({
  name: z.string().trim().min(2).max(80),
  summary: z.string().trim().min(12).max(400),
  sleeps: z.number().int().min(1).max(100).nullable(),
  sqft: z.number().int().min(1).max(30000).nullable(),
});

const manualSchema = z.object({
  mode: z.enum(["stay", "whole"]),
  slug: z.string().max(60).optional(),
  start: dateStr,
  end: dateStr,
});

const vendorSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  contactName: z.string().trim().min(2).max(120),
  email: z.string().trim().max(120),
  phone: z.string().trim().min(7).max(30),
  area: z.string().trim().min(2).max(80),
  website: z.string().trim().max(300),
  instagram: z.string().trim().max(120),
  primary: z.enum(["Weddings", "Corporate", "Birthday parties", "Retreats", "Race weekends"]),
  also: z.array(z.enum(["Weddings", "Corporate", "Birthday parties", "Retreats", "Race weekends"])).max(5),
  years: z.number().int().min(0).max(80),
  insured: z.boolean(),
});

const inquirySchema = z.object({
  kind: z.enum(["stay", "event"]),
  contactName: z.string().trim().min(2).max(80),
  email: z.string().trim().max(120),
  phone: z.string().trim().min(7).max(30),
  subject: z.string().trim().min(2).max(80),
  start: dateStr.nullable(),
  end: dateStr.nullable(),
  partySize: z.number().int().min(1).max(500),
  note: z.string().trim().max(600),
});

const rateSchema = z.object({
  slug: z.string().min(1).max(60),
  weekday: z.number().int().min(1).max(20000),
  weekend: z.number().int().min(1).max(20000),
});

type Sql = Awaited<ReturnType<typeof import("@/lib/db").getSql>>;

async function db(): Promise<Sql> {
  const { getSql } = await import("@/lib/db");
  return getSql();
}

function cutoffDate(): string {
  return addDays(new Date().toISOString().slice(0, 10), -1);
}

function refCode(prefix: string): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = `${prefix}-`;
  for (let i = 0; i < 4; i += 1) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

function emailIn(text: string): boolean {
  return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text);
}

function looksEmail(text: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim());
}

function phoneOk(text: string): boolean {
  const digits = text.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15 && /^[+0-9().\-\s]+$/.test(text.trim());
}

function cleanUrl(raw: string): string | null | Fail {
  const t = raw.trim();
  if (!t) return null;
  const withProto = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  let u: URL;
  try {
    u = new URL(withProto);
  } catch {
    return { ok: false, error: "That website address does not look usable." };
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") {
    return { ok: false, error: "Use a normal web address." };
  }
  if (u.username || u.password) return { ok: false, error: "Leave passwords out of the web address." };
  return u.toString().slice(0, 300);
}

type SpaceRow = {
  id: number;
  slug: string;
  name: string;
  kind: "stay" | "venue";
  summary: string;
  sleeps: number | null;
  sqft: number | null;
  image: string | null;
  active: boolean;
  in_buyout: boolean;
  sort: number;
  weekday_rate: number | null;
  weekend_rate: number | null;
};

function mapSpace(row: SpaceRow): Space {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    kind: row.kind,
    summary: row.summary,
    sleeps: row.sleeps,
    sqft: row.sqft,
    image: row.image,
    active: row.active,
    inBuyout: row.in_buyout,
    sort: row.sort,
    weekdayRate: row.weekday_rate,
    weekendRate: row.weekend_rate,
  };
}

async function loadSpaces(sql: Sql, activeOnly: boolean): Promise<Space[]> {
  const rows = activeOnly
    ? await sql<SpaceRow>`select id, slug, name, kind, summary, sleeps, sqft, image, active, in_buyout, sort, weekday_rate, weekend_rate from spaces where active = true order by sort, id`
    : await sql<SpaceRow>`select id, slug, name, kind, summary, sleeps, sqft, image, active, in_buyout, sort, weekday_rate, weekend_rate from spaces order by sort, id`;
  return rows.map(mapSpace);
}

async function loadBlocks(sql: Sql): Promise<Span[]> {
  const rows = await sql<{ slug: string; start: string; end: string }>`
    select s.slug as slug, b.start_date as start, b.end_date as end
    from blocks b
    join spaces s on s.id = b.space_id
    where b.end_date >= current_date - 1
      and b.start_date < current_date + interval '18 months'
  `;
  return rows;
}

async function contact(sql: Sql): Promise<string> {
  const rows = await sql<{ value: string }>`select value from ranch_settings where key = 'contact_email'`;
  return rows[0]?.value ?? "";
}

function clipText(value: unknown, max: number, fallback: string): string {
  if (typeof value !== "string") return fallback;
  return value.slice(0, max);
}

function mergePanel(row: { id: string; page: string; sort: number; hidden: boolean; fields: string }): Panel | null {
  const def = panelDef(row.id);
  if (!def) return null;
  let parsed: Partial<PanelFields> = {};
  try {
    const value = JSON.parse(row.fields) as Partial<PanelFields>;
    if (value && typeof value === "object") parsed = value;
  } catch {
    parsed = {};
  }
  const items = def.fields.items.map((item, index) => {
    const saved = parsed.items?.[index];
    return {
      stat: clipText(saved?.stat, 80, item.stat),
      title: clipText(saved?.title, 160, item.title),
      text: clipText(saved?.text, 1200, item.text),
    };
  });
  return {
    id: def.id,
    label: def.label,
    page: isPageId(row.page) ? row.page : def.page,
    sort: Number(row.sort) || def.sort,
    hidden: Boolean(row.hidden),
    edit: def.edit,
    itemMode: def.itemMode,
    fields: {
      kicker: clipText(parsed.kicker, 180, def.fields.kicker),
      title: clipText(parsed.title, 200, def.fields.title),
      body: clipText(parsed.body, 1200, def.fields.body),
      note: clipText(parsed.note, 1200, def.fields.note),
      items,
    },
  };
}

async function loadPanels(sql: Sql): Promise<Panel[]> {
  for (const def of panelDefs()) {
    await sql.query(
      `insert into page_panels (id, page, sort, hidden, fields) values ($1, $2, $3, false, $4) on conflict (id) do nothing`,
      [def.id, def.page, def.sort, JSON.stringify(def.fields)],
    );
  }
  const rows = await sql<{ id: string; page: string; sort: number; hidden: boolean; fields: string }>`
    select id, page, sort, hidden, fields from page_panels
  `;
  return rows.flatMap((row) => {
    const panel = mergePanel(row);
    return panel ? [panel] : [];
  });
}

const panelFieldsSchema = z.object({
  kicker: z.string().max(180),
  title: z.string().max(200),
  body: z.string().max(1200),
  note: z.string().max(1200),
  items: z.array(z.object({ stat: z.string().max(80), title: z.string().max(160), text: z.string().max(1200) })).max(24),
});

export const getInventory = createServerFn({ method: "GET" }).handler(async (): Promise<Inventory> => {
  const sql = await db();
  const [spaces, blocks, contactEmail, panels] = await Promise.all([
    loadSpaces(sql, true),
    loadBlocks(sql),
    contact(sql),
    loadPanels(sql),
  ]);
  return { spaces, blocks, contactEmail, panels };
});

export const getDesk = createServerFn({ method: "GET" }).handler(async (): Promise<Desk> => {
  const sql = await db();
  const spaces = await loadSpaces(sql, false);
  const blocks = await loadBlocks(sql);
  const contactEmail = await contact(sql);
  const panels = await loadPanels(sql);
  const holdRows = await sql<{
    ref_code: string;
    start: string;
    end: string;
    source: string;
    purpose: string;
    party_size: number | null;
    name: string;
  }>`
    select b.ref_code, b.start_date as start, b.end_date as end, b.source, b.purpose, b.party_size, s.name
    from blocks b
    join spaces s on s.id = b.space_id
    where b.end_date >= current_date - 1
    order by b.start_date, s.sort
  `;
  const grouped = new Map<string, HoldGroup>();
  for (const row of holdRows) {
    const key = `${row.ref_code}|${row.start}|${row.end}|${row.source}|${row.purpose}`;
    const hit = grouped.get(key);
    if (hit) hit.names.push(row.name);
    else {
      grouped.set(key, {
        refCode: row.ref_code,
        start: row.start,
        end: row.end,
        source: row.source,
        purpose: row.purpose,
        partySize: row.party_size,
        names: [row.name],
      });
    }
  }
  const vendors = await sql<{
    id: number;
    ref_code: string;
    trade: string;
    business_name: string;
    contact_name: string;
    email: string;
    phone: string;
    area: string;
    website: string | null;
    instagram: string;
    offering: string;
    serves: string;
    years_in_business: number | null;
    insured: boolean;
    created_on: string;
  }>`
    select id, ref_code, trade, business_name, contact_name, email, phone, area, website, instagram,
           offering, serves, years_in_business, insured, created_at::date as created_on
    from vendor_notes
    order by id desc
    limit 80
  `;
  const inquiries = await sql<{
    id: number;
    ref_code: string;
    kind: string;
    contact_name: string;
    email: string;
    phone: string;
    subject: string;
    start: string | null;
    end: string | null;
    party_size: number | null;
    note: string;
    created_on: string;
  }>`
    select id, ref_code, kind, contact_name, email, phone, subject,
           start_date::text as start, end_date::text as end, party_size, note,
           created_at::date as created_on
    from inquiries
    order by id desc
    limit 80
  `;
  return {
    spaces,
    blocks,
    contactEmail,
    panels,
    holds: [...grouped.values()],
    vendors: vendors.map((v) => ({
      id: v.id,
      refCode: v.ref_code,
      trade: v.trade,
      businessName: v.business_name,
      contactName: v.contact_name,
      email: v.email,
      phone: v.phone,
      area: v.area,
      website: v.website,
      instagram: v.instagram,
      offering: v.offering,
      serves: v.serves,
      years: v.years_in_business,
      insured: v.insured,
      createdOn: v.created_on,
    })),
    inquiries: inquiries.map((q) => ({
      id: q.id,
      refCode: q.ref_code,
      kind: q.kind,
      contactName: q.contact_name,
      email: q.email,
      phone: q.phone,
      subject: q.subject,
      start: q.start,
      end: q.end,
      partySize: q.party_size,
      note: q.note,
      createdOn: q.created_on,
    })),
  };
});

async function targetIds(
  sql: Sql,
  mode: "stay" | "whole" | "venues" | "venues-and-stays",
  slug: string | undefined,
): Promise<{ ids: number[]; names: string[] } | Fail> {
  if (mode === "stay") {
    if (!slug) return { ok: false, error: "Choose which stay to hold." };
    const rows = await sql<{ id: number; name: string }>`
      select id, name from spaces where slug = ${slug} and active = true and kind = 'stay'
    `;
    if (!rows[0]) return { ok: false, error: "That stay is not on the books." };
    return { ids: [rows[0].id], names: [rows[0].name] };
  }
  if (mode === "venues") {
    const rows = await sql<{ id: number; name: string }>`
      select id, name from spaces where active = true and kind = 'venue' and in_buyout = true order by sort
    `;
    if (!rows.length) return { ok: false, error: "No event grounds are open to hold." };
    return { ids: rows.map((r) => r.id), names: rows.map((r) => r.name) };
  }
  const rows = await sql<{ id: number; name: string }>`
    select id, name from spaces where active = true and in_buyout = true order by sort
  `;
  if (!rows.length) return { ok: false, error: "Nothing is marked for a whole-ranch hold." };
  return { ids: rows.map((r) => r.id), names: rows.map((r) => r.name) };
}

async function writeBlocks(
  sql: Sql,
  ids: number[],
  names: string[],
  start: string,
  end: string,
  source: string,
  purpose: string,
  partySize: number | null,
  prefix: string,
): Promise<OkRef | Fail> {
  if (!(start < end)) return { ok: false, error: "The end has to land after the start." };
  if (start < cutoffDate()) return { ok: false, error: "Those dates have already passed." };
  const [ys, ms, ds] = start.split("-").map(Number);
  const [ye, me, de] = end.split("-").map(Number);
  const nights = Math.round((Date.UTC(ye, me - 1, de) - Date.UTC(ys, ms - 1, ds)) / 86400000);
  if (nights > 31) return { ok: false, error: "Hold a month or less at a time. Write the ranch for a longer run." };
  const ph = ids.map((_, i) => `$${i + 3}`).join(", ");
  const hits = await sql.query<{ name: string }>(
    `select distinct s.name as name
     from blocks b
     join spaces s on s.id = b.space_id
     where b.start_date < $1::date
       and b.end_date > $2::date
       and s.id in (${ph})`,
    [end, start, ...ids],
  );
  if (hits.length) {
    return { ok: false, error: `${hits.map((h) => h.name).join(", ")} already has something on those dates.` };
  }
  const code = refCode(prefix);
  for (const id of ids) {
    await sql.query(
      `insert into blocks (space_id, start_date, end_date, source, purpose, party_size, ref_code)
       values ($1, $2::date, $3::date, $4, $5, $6, $7)`,
      [id, start, end, source, purpose, partySize, code],
    );
  }
  return { ok: true, refCode: code, names, start, end };
}

export const holdDates = createServerFn({ method: "POST" })
  .validator((input: unknown) => holdSchema.parse(input))
  .handler(async ({ data }): Promise<OkRef | Fail> => {
    const sql = await db();
    const target = await targetIds(sql, data.mode, data.slug);
    if ("ok" in target) return target;
    const source = data.mode === "stay" || data.mode === "venues" ? "site" : "buyout";
    return writeBlocks(sql, target.ids, target.names, data.start, data.end, source, data.purpose, data.partySize, "SR");
  });

export const addStay = createServerFn({ method: "POST" })
  .validator((input: unknown) => spaceSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true; slug: string } | Fail> => {
    const sql = await db();
    if (emailIn(data.name) || emailIn(data.summary)) {
      return { ok: false, error: "Leave email addresses out of the listing. This desk is not a private inbox." };
    }
    let base = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48);
    if (!base) base = "stay";
    let slug = base;
    for (let n = 2; n < 20; n += 1) {
      const taken = await sql<{ id: number }>`select id from spaces where slug = ${slug}`;
      if (!taken.length) break;
      slug = `${base}-${n}`;
    }
    const sortRow = await sql<{ max: number | null }>`select max(sort) as max from spaces where kind = 'stay'`;
    const sort = (sortRow[0]?.max ?? 0) + 1;
    await sql.query(
      `insert into spaces (slug, name, kind, summary, sleeps, sqft, image, active, in_buyout, sort)
       values ($1, $2, 'stay', $3, $4, $5, null, true, true, $6)`,
      [slug, data.name, data.summary, data.sleeps, data.sqft, sort],
    );
    return { ok: true, slug };
  });

export const setStayActive = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ slug: z.string().min(1).max(60), active: z.boolean() }).parse(input))
  .handler(async ({ data }): Promise<{ ok: true } | Fail> => {
    const sql = await db();
    const rows = await sql<{ id: number }>`update spaces set active = ${data.active} where slug = ${data.slug} and kind = 'stay' returning id`;
    if (!rows.length) return { ok: false, error: "That stay is not listed." };
    return { ok: true };
  });

export const setContactEmail = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ email: z.string().trim().max(120) }).parse(input))
  .handler(async ({ data }): Promise<{ ok: true } | Fail> => {
    const email = data.email.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: "That does not look like an email address." };
    }
    const sql = await db();
    await sql`insert into ranch_settings (key, value) values ('contact_email', ${email})
      on conflict (key) do update set value = excluded.value`;
    return { ok: true };
  });

export const manualHold = createServerFn({ method: "POST" })
  .validator((input: unknown) => manualSchema.parse(input))
  .handler(async ({ data }): Promise<OkRef | Fail> => {
    const sql = await db();
    const target = await targetIds(sql, data.mode === "whole" ? "whole" : "stay", data.slug);
    if ("ok" in target) return target;
    return writeBlocks(sql, target.ids, target.names, data.start, data.end, "manual", "other", null, "MN");
  });

export const releaseHold = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ refCode: z.string().trim().max(12) }).parse(input))
  .handler(async ({ data }): Promise<{ ok: true; removed: number } | Fail> => {
    const code = data.refCode.trim().toUpperCase();
    if (!/^[A-Z]{2}-[A-Z0-9]{4}$/.test(code)) {
      return { ok: false, error: "Reference codes look like SR-7K2M." };
    }
    const sql = await db();
    const rows = await sql<{ id: number }>`delete from blocks where ref_code = ${code} returning id`;
    if (!rows.length) return { ok: false, error: "No hold uses that reference." };
    return { ok: true, removed: rows.length };
  });

function blockedHost(host: string): boolean {
  const h = host.toLowerCase().replace(/\.+$/, "");
  if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal") || h === "0.0.0.0") return true;
  const ipv4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipv4) return false;
  const n = ipv4.slice(1).map(Number);
  if (n.some((x) => x > 255)) return true;
  const [a, b] = n;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 169 && b === 254) return true;
  return false;
}

function parseIcal(text: string): { start: string; end: string }[] {
  const unfolded = text.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "");
  const events = unfolded.split("BEGIN:VEVENT").slice(1);
  const out: { start: string; end: string }[] = [];
  for (const ev of events) {
    const chunk = ev.split("END:VEVENT")[0] ?? "";
    if (/^STATUS:CANCELLED/m.test(chunk)) continue;
    const start = grab(chunk, "DTSTART");
    if (!start) continue;
    const end = grab(chunk, "DTEND") ?? addDays(start, 1);
    if (end > start) out.push({ start, end });
  }
  return out;
}

function grab(chunk: string, key: string): string | null {
  const re = new RegExp(`^${key}(?:;[^:\\n]*)?:([0-9]{8})`, "m");
  const m = chunk.match(re);
  if (!m) return null;
  const v = m[1];
  return `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;
}

export const pullAirbnb = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({ slug: z.string().min(1).max(60), icalUrl: z.string().trim().max(500) }).parse(input),
  )
  .handler(async ({ data }): Promise<{ ok: true; count: number } | Fail> => {
    let u: URL;
    try {
      u = new URL(data.icalUrl.trim());
    } catch {
      return { ok: false, error: "Paste the full calendar link, starting with https://." };
    }
    if (u.protocol !== "https:") return { ok: false, error: "Only https calendar links are accepted." };
    if (blockedHost(u.hostname)) return { ok: false, error: "That address is not a public calendar." };
    const sql = await db();
    const space = await sql<{ id: number }>`
      select id from spaces where slug = ${data.slug} and kind = 'stay' and active = true
    `;
    if (!space[0]) return { ok: false, error: "That stay is not listed." };
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    let text = "";
    try {
      const res = await fetch(u, {
        signal: ctrl.signal,
        redirect: "follow",
        headers: { "user-agent": "SerendipitousRanchCalendar/1.0" },
      });
      if (!res.ok) return { ok: false, error: `The calendar link answered ${res.status}. Nothing was changed.` };
      text = await res.text();
    } catch {
      return { ok: false, error: "Could not reach that calendar. Check the link, or block the dates by hand." };
    } finally {
      clearTimeout(timer);
    }
    if (text.length > 1_000_000) return { ok: false, error: "That file is too large to import." };
    if (!text.includes("BEGIN:VCALENDAR")) {
      return { ok: false, error: "That link did not return a calendar file." };
    }
    const parsed = parseIcal(text);
    if (text.includes("BEGIN:VEVENT") && parsed.length === 0) {
      return { ok: false, error: "Events were in the file, but the dates could not be read. Nothing was changed." };
    }
    const floor = cutoffDate();
    const horizon = addDays(floor, 540);
    const upcoming = parsed.filter((e) => e.end > floor && e.start < horizon).slice(0, 200);
    await sql`delete from blocks where space_id = ${space[0].id} and source = 'airbnb'`;
    for (const ev of upcoming) {
      await sql.query(
        `insert into blocks (space_id, start_date, end_date, source, purpose, party_size, ref_code)
         values ($1, $2::date, $3::date, 'airbnb', 'import', null, $4)`,
        [space[0].id, ev.start, ev.end, refCode("AB")],
      );
    }
    return { ok: true, count: upcoming.length };
  });

export const dismissVendor = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ refCode: z.string().trim().max(12) }).parse(input))
  .handler(async ({ data }): Promise<{ ok: true } | Fail> => {
    const code = data.refCode.trim().toUpperCase();
    if (!/^VN-[A-Z0-9]{4}$/.test(code)) return { ok: false, error: "That is not a vendor reference." };
    const sql = await db();
    const rows = await sql<{ id: number }>`delete from vendor_notes where ref_code = ${code} returning id`;
    if (!rows.length) return { ok: false, error: "No vendor note uses that reference." };
    return { ok: true };
  });

export const submitVendor = createServerFn({ method: "POST" })
  .validator((input: unknown) => vendorSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true; refCode: string } | Fail> => {
    if (!looksEmail(data.email)) return { ok: false, error: "That email address does not look usable." };
    if (!phoneOk(data.phone)) return { ok: false, error: "Use a phone number we can actually dial." };
    if (
      emailIn(data.businessName) ||
      emailIn(data.contactName) ||
      emailIn(data.area) ||
      emailIn(data.instagram) ||
      emailIn(data.website)
    ) {
      return { ok: false, error: "Put the email in the email field, not in the other lines." };
    }
    const site = cleanUrl(data.website);
    if (site && typeof site === "object") return site;
    const instagram = data.instagram.replace(/^@+/, "").trim();
    const works = [data.primary, ...data.also.filter((item) => item !== data.primary)];
    const sql = await db();
    const code = refCode("VN");
    await sql.query(
      `insert into vendor_notes (
         ref_code, trade, business_name, website, offering, serves, insured,
         contact_name, email, phone, area, instagram, years_in_business
       )
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        code,
        data.primary,
        data.businessName,
        site,
        `${data.years} years in business. Based in ${data.area}.`,
        works.join(", "),
        data.insured,
        data.contactName,
        data.email.trim(),
        data.phone.trim(),
        data.area,
        instagram,
        data.years,
      ],
    );
    return { ok: true, refCode: code };
  });

export const submitInquiry = createServerFn({ method: "POST" })
  .validator((input: unknown) => inquirySchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true; refCode: string } | Fail> => {
    if (!looksEmail(data.email)) return { ok: false, error: "That email address does not look usable." };
    if (!phoneOk(data.phone)) return { ok: false, error: "Use a phone number we can actually dial." };
    if (emailIn(data.contactName) || emailIn(data.subject)) {
      return { ok: false, error: "Put the email in the email field, not in the name." };
    }
    let start: string | null = data.start;
    let end: string | null = data.end;
    if ((start && !end) || (!start && end)) {
      return { ok: false, error: "Give both ends of the dates, or leave both blank." };
    }
    if (start && end && !(start < end)) {
      return { ok: false, error: "The end has to land after the start." };
    }
    if (!start) {
      start = null;
      end = null;
    }
    const sql = await db();
    const code = refCode("QR");
    await sql.query(
      `insert into inquiries (ref_code, kind, contact_name, email, phone, subject, start_date, end_date, party_size, note)
       values ($1, $2, $3, $4, $5, $6, NULLIF($7, '')::date, NULLIF($8, '')::date, $9, $10)`,
      [
        code,
        data.kind,
        data.contactName,
        data.email.trim(),
        data.phone.trim(),
        data.subject,
        start ?? "",
        end ?? "",
        data.partySize,
        data.note,
      ],
    );
    return { ok: true, refCode: code };
  });

export const dismissInquiry = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ refCode: z.string().trim().max(12) }).parse(input))
  .handler(async ({ data }): Promise<{ ok: true } | Fail> => {
    const code = data.refCode.trim().toUpperCase();
    if (!/^QR-[A-Z0-9]{4}$/.test(code)) return { ok: false, error: "That is not a quote reference." };
    const sql = await db();
    const rows = await sql<{ id: number }>`delete from inquiries where ref_code = ${code} returning id`;
    if (!rows.length) return { ok: false, error: "No quote uses that reference." };
    return { ok: true };
  });

export const setStayRates = createServerFn({ method: "POST" })
  .validator((input: unknown) => rateSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true } | Fail> => {
    const sql = await db();
    const rows = await sql<{ id: number }>`
      update spaces
      set weekday_rate = ${data.weekday}, weekend_rate = ${data.weekend}
      where slug = ${data.slug} and kind = 'stay'
      returning id
    `;
    if (!rows.length) return { ok: false, error: "That stay is not listed." };
    return { ok: true };
  });

export const setStayCopy = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        slug: z.string().min(1).max(60),
        name: z.string().trim().min(2).max(80),
        summary: z.string().trim().min(2).max(400),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<{ ok: true } | Fail> => {
    const sql = await db();
    const rows = await sql<{ id: number }>`
      update spaces set name = ${data.name.trim()}, summary = ${data.summary.trim()}
      where slug = ${data.slug} and kind = 'stay'
      returning id
    `;
    if (!rows.length) return { ok: false, error: "That stay is not listed." };
    return { ok: true };
  });

export const savePanelFields = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ id: z.string().min(1).max(60), fields: panelFieldsSchema }).parse(input))
  .handler(async ({ data }): Promise<{ ok: true } | Fail> => {
    const def = panelDef(data.id);
    if (!def) return { ok: false, error: "That panel is not on the site." };
    const fields: PanelFields = {
      kicker: data.fields.kicker,
      title: data.fields.title,
      body: data.fields.body,
      note: data.fields.note,
      items: def.fields.items.map((item, index) => ({
        stat: data.fields.items[index]?.stat ?? item.stat,
        title: data.fields.items[index]?.title ?? item.title,
        text: data.fields.items[index]?.text ?? item.text,
      })),
    };
    const sql = await db();
    await loadPanels(sql);
    await sql.query(`update page_panels set fields = $2 where id = $1`, [data.id, JSON.stringify(fields)]);
    return { ok: true };
  });

export const movePanel = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ id: z.string().min(1).max(60), dir: z.union([z.literal(-1), z.literal(1)]) }).parse(input))
  .handler(async ({ data }): Promise<{ ok: true } | Fail> => {
    const sql = await db();
    const panels = await loadPanels(sql);
    const current = panels.find((panel) => panel.id === data.id);
    if (!current) return { ok: false, error: "That panel is not on the site." };
    const siblings = panels
      .filter((panel) => panel.page === current.page && !panel.hidden)
      .sort((a, b) => a.sort - b.sort || a.label.localeCompare(b.label));
    const index = siblings.findIndex((panel) => panel.id === current.id);
    const neighbor = siblings[index + data.dir];
    if (!neighbor) return { ok: true };
    await sql.query(`update page_panels set sort = $2 where id = $1`, [current.id, neighbor.sort]);
    await sql.query(`update page_panels set sort = $2 where id = $1`, [neighbor.id, current.sort]);
    return { ok: true };
  });

export const placePanel = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ id: z.string().min(1).max(60), page: z.string().min(1).max(20) }).parse(input))
  .handler(async ({ data }): Promise<{ ok: true } | Fail> => {
    if (!isPageId(data.page)) return { ok: false, error: "That page is not on the site." };
    const page: PageId = data.page;
    const sql = await db();
    await loadPanels(sql);
    const max = await sql<{ max: number | null }>`select max(sort) as max from page_panels where page = ${page}`;
    const sort = (max[0]?.max ?? 0) + 1;
    const rows = await sql<{ id: string }>`
      update page_panels set page = ${page}, sort = ${sort}, hidden = false where id = ${data.id} returning id
    `;
    if (!rows.length) return { ok: false, error: "That panel is not on the site." };
    return { ok: true };
  });

export const setPanelHidden = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ id: z.string().min(1).max(60), hidden: z.boolean() }).parse(input))
  .handler(async ({ data }): Promise<{ ok: true } | Fail> => {
    const sql = await db();
    await loadPanels(sql);
    const rows = await sql<{ id: string }>`update page_panels set hidden = ${data.hidden} where id = ${data.id} returning id`;
    if (!rows.length) return { ok: false, error: "That panel is not on the site." };
    return { ok: true };
  });
