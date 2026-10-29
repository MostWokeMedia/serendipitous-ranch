import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { FeedLink } from "@/components/feed-link";
import { PanelEditor } from "@/components/panel-editor";
import { SiteFrame } from "@/components/site-frame";
import {
  addStay,
  dismissInquiry,
  getDesk,
  manualHold,
  pullAirbnb,
  releaseHold,
  setContactEmail,
  setStayActive,
  setStayCopy,
  setStayRates,
  dismissVendor,
} from "@/lib/ranch/api";
import { RECURRING, TIERS } from "@/lib/ranch/content";
import { formatHold } from "@/lib/ranch/dates";

export const Route = createFileRoute("/steward")({
  loader: () => getDesk(),
  head: () => ({
    meta: [
      { title: "Ranch desk · Serendipitous Ranch" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DeskPage,
});

function DeskPage() {
  const data = Route.useLoaderData();
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const stays = data.spaces.filter((s) => s.kind === "stay");

  async function run(work: () => Promise<{ ok: boolean; error?: string } | { ok: true }>, success: string) {
    setError("");
    setNotice("");
    try {
      const result = await work();
      if (!result.ok) {
        setError("error" in result && result.error ? result.error : "That did not save.");
        return;
      }
      setNotice(success);
      await router.invalidate();
    } catch {
      setError("Something failed on the way to the calendar.");
    }
  }

  return (
    <SiteFrame>
      <section className="wrap py-12">
        <p className="kicker">Ranch desk</p>
        <h1 className="mt-3 text-5xl">Quotes, rates, and the Airbnb feeds.</h1>
        <p className="mt-4 max-w-2xl text-muted">
          This desk is not on the public menu and it is not behind a sign-in. Quotes and vendor applications
          include names, emails, and phone numbers. Do not share the address. Airbnb export links are read once
          and not saved. Event prices below are internal. Nightly rates are what the public calendars show.
        </p>
        {notice ? <p className="mt-4 text-accent" role="status">{notice}</p> : null}
        {error ? <p className="mt-4 text-accent" role="alert">{error}</p> : null}
      </section>

      <PanelEditor panels={data.panels} onRun={run} />

      <section className="wrap grid gap-8 pb-10 lg:grid-cols-2">
        <EmailForm
          current={data.contactEmail}
          onSave={(email) => run(() => setContactEmail({ data: { email } }), email ? "Contact email saved." : "Contact email cleared.")}
        />
        <AddForm
          onAdd={(input) =>
            run(async () => {
              const res = await addStay({ data: input });
              return res;
            }, "Stay added. It is on the stay page and inside whole-ranch holds.")
          }
        />
      </section>

      <section className="wrap pb-12">
        <h2 className="text-3xl">Quote requests</h2>
        <p className="mt-2 text-sm text-muted">From the public forms. Nothing here has locked a date.</p>
        {data.inquiries.length === 0 ? <p className="mt-3 text-muted">No quotes yet.</p> : null}
        <ul className="mt-4 space-y-4">
          {data.inquiries.map((q) => (
            <li key={q.id} className="panel p-5">
              <p className="text-sm text-accent">
                {q.refCode} · {q.createdOn} · {q.kind}
              </p>
              <div className="mt-1 flex items-start justify-between gap-3">
                <h3 className="text-2xl">{q.subject}</h3>
                <button
                  type="button"
                  className="btn-line"
                  onClick={() =>
                    void run(() => dismissInquiry({ data: { refCode: q.refCode } }), `${q.refCode} removed.`)
                  }
                >
                  Remove
                </button>
              </div>
              <p className="mt-2">
                {q.contactName} · {q.email} · {q.phone}
              </p>
              <p className="text-sm text-muted">
                {q.start && q.end ? formatHold(q.start, q.end, q.kind === "event" ? "days" : "nights") : "No dates"}
                {q.partySize ? ` · ${q.partySize} people` : ""}
              </p>
              {q.note ? <p className="mt-2 text-sm">{q.note}</p> : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="wrap pb-12">
        <h2 className="text-3xl">Event rate card</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Not shown on the site. Per-person figures assume about forty people. A different headcount changes that
          math. It does not silently change the day rate until the group or the scope moves.
        </p>
        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          {TIERS.map((t) => (
            <article key={t.id} className="panel p-5">
              <h3 className="text-2xl">{t.name}</h3>
              <p className="mt-3 font-display text-4xl tabular-nums">{t.price}</p>
              <p className="text-sm text-muted">{t.per} a person at 40</p>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                {t.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="mt-6 overflow-x-auto border border-border">
          <table className="w-full min-w-2xl text-left text-sm">
            <caption className="sr-only">Recurring pricing on a ten-thousand-dollar day</caption>
            <thead className="bg-bg text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Commitment</th>
                <th className="px-4 py-3 font-medium">Discount</th>
                <th className="px-4 py-3 font-medium">On a $10k day</th>
                <th className="px-4 py-3 font-medium">Terms</th>
              </tr>
            </thead>
            <tbody>
              {RECURRING.map((row) => (
                <tr key={row.name} className="border-t border-border">
                  <th className="px-4 py-4 font-display text-lg font-medium text-fg">{row.name}</th>
                  <td className="px-4 py-4 tabular-nums">{row.discount}</td>
                  <td className="px-4 py-4 tabular-nums">{row.example}</td>
                  <td className="px-4 py-4 text-muted">{row.terms}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-3xl text-sm text-muted">
          The rate stays put as long as the group stays within 20% of the original headcount and the core does not
          change — meals, activities, facilitator.
        </p>
      </section>

      <section className="wrap space-y-4 pb-12">
        <h2 className="text-3xl">Stays</h2>
        {stays.map((stay) => (
          <article key={stay.slug} className="panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl">{stay.name}</h3>
                <p className="text-sm text-muted">{stay.active ? "Listed" : "Hidden"} · {stay.slug}</p>
              </div>
              <button
                type="button"
                className="btn-line"
                onClick={() =>
                  void run(
                    () => setStayActive({ data: { slug: stay.slug, active: !stay.active } }),
                    stay.active ? `${stay.name} hidden.` : `${stay.name} listed again.`,
                  )
                }
              >
                {stay.active ? "Hide" : "List again"}
              </button>
            </div>
            <p className="mt-3 text-sm text-muted">{stay.summary}</p>
            <CopyForm
              name={stay.name}
              summary={stay.summary}
              onSave={(name, summary) =>
                run(() => setStayCopy({ data: { slug: stay.slug, name, summary } }), `${name} wording saved.`)
              }
            />
            <RateForm
              weekday={stay.weekdayRate}
              weekend={stay.weekendRate}
              onSave={(weekday, weekend) =>
                run(
                  () => setStayRates({ data: { slug: stay.slug, weekday, weekend } }),
                  `${stay.name} rates saved. The public calendar uses them.`,
                )
              }
            />
            {stay.active ? (
              <div className="mt-4">
                <p className="label">Feed to import into this listing on Airbnb</p>
                <FeedLink slug={stay.slug} name={stay.name} />
                <PullForm
                  onPull={async (icalUrl) => {
                    setError("");
                    setNotice("");
                    const res = await pullAirbnb({ data: { slug: stay.slug, icalUrl } });
                    if (!res.ok) {
                      setError(res.error);
                      return;
                    }
                    setNotice(
                      res.count
                        ? `Read ${res.count} Airbnb date${res.count === 1 ? "" : "s"} onto ${stay.name}. The link was not saved.`
                        : `No upcoming Airbnb dates on ${stay.name}. The link was not saved.`,
                    );
                    await router.invalidate();
                  }}
                />
              </div>
            ) : null}
          </article>
        ))}
      </section>

      <section className="wrap grid gap-8 pb-12 lg:grid-cols-2">
        <ManualForm
          stays={stays.filter((s) => s.active)}
          onSave={(input) =>
            run(async () => {
              const res = await manualHold({ data: input });
              if (!res.ok) return res;
              return { ok: true as const };
            }, "Manual hold written.")
          }
        />
        <ReleaseForm
          onRelease={(refCode) =>
            run(async () => {
              const res = await releaseHold({ data: { refCode } });
              if (!res.ok) return res;
              return { ok: true as const };
            }, "Hold released.")
          }
        />
      </section>

      <section className="wrap pb-12">
        <h2 className="text-3xl">Open holds</h2>
        {data.holds.length === 0 ? <p className="mt-3 text-muted">Nothing is held.</p> : null}
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {data.holds.map((hold) => (
            <li key={`${hold.refCode}${hold.start}${hold.names.join()}`} className="grid gap-2 py-4 md:grid-cols-4">
              <p className="font-display text-xl">{hold.refCode}</p>
              <div className="md:col-span-3">
                <p>{formatHold(hold.start, hold.end, hold.purpose === "corporate" ? "days" : "nights")}</p>
                <p className="text-sm text-muted">
                  {hold.names.join(", ")} · {hold.source} · {hold.purpose}
                  {hold.partySize ? ` · ${hold.partySize} people` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="wrap pb-20">
        <h2 className="text-3xl">Vendor notes</h2>
        {data.vendors.length === 0 ? <p className="mt-3 text-muted">No applications yet.</p> : null}
        <ul className="mt-4 space-y-4">
          {data.vendors.map((v) => (
            <li key={v.id} className="panel p-5">
              <p className="text-sm text-accent">
                {v.refCode} · {v.createdOn}
              </p>
              <div className="mt-1 flex items-start justify-between gap-3">
                <h3 className="text-2xl">{v.businessName}</h3>
                <button
                  type="button"
                  className="btn-line"
                  onClick={() =>
                    void run(
                      () => dismissVendor({ data: { refCode: v.refCode } }),
                      `${v.businessName} removed.`,
                    )
                  }
                >
                  Remove
                </button>
              </div>
              <p className="text-muted">
                {v.contactName ? `${v.contactName} · ` : ""}
                {v.trade}
                {v.serves && v.serves !== v.trade ? ` · also ${v.serves}` : ""}
                {v.years != null ? ` · ${v.years} years` : ""}
                {v.insured ? " · insured" : " · insurance not confirmed"}
              </p>
              <p className="mt-2 text-sm">
                {v.email ? <a href={`mailto:${v.email}`}>{v.email}</a> : "No email"}
                {v.phone ? ` · ${v.phone}` : ""}
                {v.area ? ` · ${v.area}` : ""}
                {v.instagram ? ` · @${v.instagram.replace(/^@/, "")}` : ""}
              </p>
              {v.website ? (
                <a className="mt-2 inline-flex min-h-11 items-center underline decoration-border underline-offset-4" href={v.website}>
                  {v.website}
                </a>
              ) : null}
              <p className="mt-2 text-sm">{v.offering}</p>
            </li>
          ))}
        </ul>
      </section>
    </SiteFrame>
  );
}

function CopyForm({
  name,
  summary,
  onSave,
}: {
  name: string;
  summary: string;
  onSave: (name: string, summary: string) => void;
}) {
  const [nextName, setNextName] = useState(name);
  const [nextSummary, setNextSummary] = useState(summary);
  return (
    <form
      className="mt-4 grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(nextName, nextSummary);
      }}
    >
      <label>
        <span className="label">Name on the calendar</span>
        <input className="control" required minLength={2} maxLength={80} value={nextName} onChange={(event) => setNextName(event.target.value)} />
      </label>
      <label>
        <span className="label">Line under the name</span>
        <textarea className="control" required minLength={2} maxLength={400} value={nextSummary} onChange={(event) => setNextSummary(event.target.value)} />
      </label>
      <button className="btn w-fit" type="submit">
        Save words
      </button>
    </form>
  );
}

function RateForm({
  weekday,
  weekend,
  onSave,
}: {
  weekday: number | null;
  weekend: number | null;
  onSave: (weekday: number, weekend: number) => void;
}) {
  const [week, setWeek] = useState(weekday ? String(weekday) : "");
  const [end, setEnd] = useState(weekend ? String(weekend) : "");
  return (
    <form
      className="mt-4 grid gap-3 sm:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(Number(week), Number(end));
      }}
    >
      <label>
        <span className="label">Sun–Thu</span>
        <input className="control" inputMode="numeric" required value={week} onChange={(e) => setWeek(e.target.value)} />
      </label>
      <label>
        <span className="label">Fri–Sat</span>
        <input className="control" inputMode="numeric" required value={end} onChange={(e) => setEnd(e.target.value)} />
      </label>
      <div className="flex items-end">
        <button className="btn w-full" type="submit">
          Save rates
        </button>
      </div>
    </form>
  );
}

function EmailForm({ current, onSave }: { current: string; onSave: (email: string) => void }) {
  const [email, setEmail] = useState(current);
  return (
    <form
      className="panel p-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(email);
      }}
    >
      <h2 className="text-2xl">Public contact</h2>
      <p className="mt-2 text-sm text-muted">Shown as the mailbox for a hold reference. Leave blank to hide it.</p>
      <label className="mt-4 block">
        <span className="label">Email</span>
        <input className="control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <button className="btn mt-4" type="submit">
        Save
      </button>
    </form>
  );
}

function AddForm({
  onAdd,
}: {
  onAdd: (input: { name: string; summary: string; sleeps: number | null; sqft: number | null }) => void;
}) {
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [sleeps, setSleeps] = useState("");
  const [sqft, setSqft] = useState("");
  return (
    <form
      className="panel p-5"
      onSubmit={(e) => {
        e.preventDefault();
        onAdd({
          name,
          summary,
          sleeps: sleeps ? Number(sleeps) : null,
          sqft: sqft ? Number(sqft) : null,
        });
        setName("");
        setSummary("");
        setSleeps("");
        setSqft("");
      }}
    >
      <h2 className="text-2xl">Add a stay</h2>
      <p className="mt-2 text-sm text-muted">It joins the stay page. Set the Sun–Thu and Fri–Sat rates on the card after it appears.</p>
      <label className="mt-4 block">
        <span className="label">Name</span>
        <input className="control" required minLength={2} maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="mt-4 block">
        <span className="label">Summary</span>
        <textarea className="control" required minLength={12} maxLength={400} value={summary} onChange={(e) => setSummary(e.target.value)} />
      </label>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label>
          <span className="label">Sleeps</span>
          <input className="control" inputMode="numeric" value={sleeps} onChange={(e) => setSleeps(e.target.value)} />
        </label>
        <label>
          <span className="label">Sq ft</span>
          <input className="control" inputMode="numeric" value={sqft} onChange={(e) => setSqft(e.target.value)} />
        </label>
      </div>
      <button className="btn mt-4" type="submit">
        Add stay
      </button>
    </form>
  );
}

function PullForm({ onPull }: { onPull: (url: string) => Promise<void> }) {
  const [url, setUrl] = useState("");
  return (
    <form
      className="mt-4 flex flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        onPull(url);
        setUrl("");
      }}
    >
      <label className="flex-1">
        <span className="sr-only">Airbnb export link</span>
        <input className="control" placeholder="Paste Airbnb export link" value={url} onChange={(e) => setUrl(e.target.value)} required />
      </label>
      <button className="btn" type="submit">
        Pull dates
      </button>
    </form>
  );
}

function ManualForm({
  stays,
  onSave,
}: {
  stays: { slug: string; name: string }[];
  onSave: (input: { mode: "stay" | "whole"; slug?: string; start: string; end: string }) => void;
}) {
  const [mode, setMode] = useState<"stay" | "whole">("stay");
  const [slug, setSlug] = useState(stays[0]?.slug ?? "");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  return (
    <form
      className="panel p-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ mode, slug: mode === "stay" ? slug : undefined, start, end });
      }}
    >
      <h2 className="text-2xl">Block by hand</h2>
      <p className="mt-2 text-sm text-muted">Departure date is the morning they leave, same as the public calendar. For a single night, end is the next day.</p>
      <label className="mt-4 block">
        <span className="label">Where</span>
        <select
          className="control"
          value={mode === "whole" ? "whole" : slug}
          onChange={(e) => {
            if (e.target.value === "whole") setMode("whole");
            else {
              setMode("stay");
              setSlug(e.target.value);
            }
          }}
        >
          {stays.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
          <option value="whole">Whole property</option>
        </select>
      </label>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label>
          <span className="label">Start</span>
          <input className="control" type="date" required value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label>
          <span className="label">End</span>
          <input className="control" type="date" required value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
      </div>
      <button className="btn mt-4" type="submit">
        Block
      </button>
    </form>
  );
}

function ReleaseForm({ onRelease }: { onRelease: (code: string) => void }) {
  const [code, setCode] = useState("");
  return (
    <form
      className="panel p-5"
      onSubmit={(e) => {
        e.preventDefault();
        onRelease(code);
        setCode("");
      }}
    >
      <h2 className="text-2xl">Release a reference</h2>
      <p className="mt-2 text-sm text-muted">Clears every building tied to that code. It does not wipe the calendar.</p>
      <label className="mt-4 block">
        <span className="label">Reference</span>
        <input className="control" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="SR-7K2M" required />
      </label>
      <button className="btn mt-4" type="submit">
        Release
      </button>
    </form>
  );
}
