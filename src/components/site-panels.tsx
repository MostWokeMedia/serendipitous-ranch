import { Link } from "@tanstack/react-router";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { HeroImage, HeroVideo } from "@/components/hero-video";
import { RangeCalendar } from "@/components/range-calendar";
import { submitInquiry, submitVendor, type Inventory, type Space } from "@/lib/ranch/api";
import { ADDRESS, MAPS, WORKS } from "@/lib/ranch/content";
import { addDays, formatHold, money, stayTotal } from "@/lib/ranch/dates";
import { panelById, panelsOn, type PageId, type Panel, type PanelItem } from "@/lib/ranch/panels";

const PHOTOS: Record<string, { src: string; alt: string }> = {
  "Guest House": {
    src: "/images/guest-house.jpg",
    alt: "Cream guest house with a dark porch and teal door at sunset",
  },
  "Ranch House": {
    src: "/images/ranch-house.jpg",
    alt: "Stone ranch house with a metal roof, garden, and round fire pit",
  },
  "Geodesic Temple": {
    src: "/images/geodesic.jpg",
    alt: "Geodesic temple with a blue metal roof, wooden doors, and a timber porch",
  },
  "Covered Pavilion": {
    src: "/images/pavilion.jpg",
    alt: "Covered pavilion with a long table and a timber stage under a metal roof",
  },
  "Adobe Temple": {
    src: "/images/adobe.jpg",
    alt: "Hexagonal adobe temple with a blue tile roof, columns, and a cactus garden",
  },
};

/** Photo for a panel card, matched by the card's title so removing or reordering cards never shifts photos. */
function photoFor(title: string): { src: string; alt: string } | undefined {
  return PHOTOS[title.trim()];
}

type Pick = { slug: string; start: string | null; end: string | null };

const StayPickContext = createContext<{ pick: Pick; setPick: (pick: Pick) => void } | null>(null);

function StayPickProvider({ firstSlug, children }: { firstSlug: string; children: ReactNode }) {
  const [pick, setPick] = useState<Pick>({ slug: firstSlug, start: null, end: null });
  const value = useMemo(() => ({ pick, setPick }), [pick]);
  return <StayPickContext.Provider value={value}>{children}</StayPickContext.Provider>;
}

function useStayPick(): { pick: Pick; setPick: (pick: Pick) => void } {
  const value = useContext(StayPickContext);
  if (!value)
    return { pick: { slug: "ranch-house", start: null, end: null }, setPick: () => undefined };
  return value;
}

export function PageStack({ page, inventory }: { page: PageId; inventory: Inventory }) {
  const first = inventory.spaces.find((space) => space.kind === "stay")?.slug ?? "ranch-house";
  const ordered = panelsOn(inventory.panels, page);
  return (
    <StayPickProvider firstSlug={first}>
      {ordered.map((panel) => (
        <PanelSwitch key={panel.id} panel={panel} inventory={inventory} />
      ))}
    </StayPickProvider>
  );
}

export function driveItems(inventory: Inventory): { value: string; label: string }[] {
  return panelById(inventory.panels, "home-drives").fields.items.map((item) => ({
    value: item.stat,
    label: item.title,
  }));
}

function PanelSwitch({ panel, inventory }: { panel: Panel; inventory: Inventory }) {
  const fields = panel.fields;
  switch (panel.id) {
    case "home-hero":
      return <HeroVideo />;
    case "home-intro":
      return (
        <section className="wrap py-14">
          {fields.kicker ? <p className="kicker">{fields.kicker}</p> : null}
          <h1 className="mt-4 max-w-4xl text-5xl text-fg sm:text-7xl">{fields.title}</h1>
          <p className="mt-5 max-w-2xl text-lg whitespace-pre-wrap text-fg">{fields.body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/stay" className="btn">
              See the calendars
            </Link>
            <Link to="/events" className="btn-line">
              Request a quote
            </Link>
          </div>
        </section>
      );
    case "home-drives":
      return (
        <section>
          <div className="wrap grid overflow-hidden border border-border bg-border sm:grid-cols-3">
            {fields.items.map((item) => (
              <div key={item.title} className="bg-surface px-5 py-6">
                <p className="font-display text-4xl tabular-nums text-fg">{item.stat}</p>
                <p className="mt-1 text-muted">{item.title}</p>
              </div>
            ))}
          </div>
          <p className="wrap mt-4 text-sm text-muted">
            <a href={MAPS} className="underline decoration-border underline-offset-4">
              {ADDRESS}
            </a>
          </p>
        </section>
      );
    case "home-sleep":
      return (
        <section className="wrap py-20">
          {fields.kicker ? <p className="kicker">{fields.kicker}</p> : null}
          <h2 className="mt-3 max-w-2xl text-4xl sm:text-5xl">{fields.title}</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {fields.items.map((item, index) => (
              <Link key={item.title} to="/stay" className="panel block overflow-hidden">
                <img
                  src={photoFor(item.title)?.src}
                  alt={photoFor(item.title)?.alt ?? ""}
                  className="aspect-3/2 w-full object-cover"
                />
                <div className="p-5">
                  <p className="text-sm text-accent">{item.stat}</p>
                  <h3 className="mt-1 text-3xl">{item.title}</h3>
                  <p className="mt-2 whitespace-pre-wrap text-muted">{item.text}</p>
                </div>
              </Link>
            ))}
          </div>
          {fields.note ? (
            <p className="mt-6 max-w-3xl whitespace-pre-wrap text-muted">{fields.note}</p>
          ) : null}
        </section>
      );
    case "home-rooms":
      return (
        <section className="wrap pb-8">
          <div className="grid gap-4 md:grid-cols-2">
            {fields.items.map((item, index) => (
              <figure key={item.title} className="panel overflow-hidden">
                <img
                  src={photoFor(item.title)?.src}
                  alt={photoFor(item.title)?.alt ?? ""}
                  className="aspect-3/2 w-full object-cover"
                />
                <figcaption className="p-5">
                  <p className="text-sm text-accent">{item.stat}</p>
                  <h3 className="mt-1 text-3xl">{item.title}</h3>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <h2 className="max-w-xl text-4xl">{fields.title}</h2>
            <Link to="/grounds" className="btn-line">
              Walk the grounds
            </Link>
          </div>
        </section>
      );
    case "home-land":
      return (
        <section className="wrap grid gap-10 py-16 md:grid-cols-2">
          <div>
            {fields.kicker ? <p className="kicker">{fields.kicker}</p> : null}
            <h2 className="mt-3 text-4xl">{fields.title}</h2>
            <p className="mt-4 whitespace-pre-wrap text-muted">{fields.body}</p>
          </div>
          <StatList items={fields.items} />
        </section>
      );
    case "home-gatherings":
      return (
        <section className="border-y border-border bg-surface">
          <div className="wrap py-16">
            {fields.kicker ? <p className="kicker">{fields.kicker}</p> : null}
            <h2 className="mt-3 text-4xl">{fields.title}</h2>
            <CardGrid items={fields.items} />
          </div>
        </section>
      );
    case "home-events":
      return (
        <section className="wrap py-16">
          {fields.kicker ? <p className="kicker">{fields.kicker}</p> : null}
          <h2 className="mt-3 max-w-2xl text-4xl">{fields.title}</h2>
          <CardGrid items={fields.items} panel />
          <Link to="/events" className="btn mt-8">
            Request a quote
          </Link>
        </section>
      );
    case "grounds-intro":
      return (
        <>
          <HeroImage
            src="/images/grounds-hero-aerial.jpg"
            webp="/images/grounds-hero-aerial.webp"
            alt="Aerial view of the ranch grounds"
          />
          <section className="wrap py-12">
            {fields.kicker ? <p className="kicker">{fields.kicker}</p> : null}
            <h1 className="mt-3 max-w-3xl text-5xl">{fields.title}</h1>
            <p className="mt-4 max-w-2xl whitespace-pre-wrap text-muted">{fields.body}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <a href="#buildings" className="btn-line">
                Buildings
              </a>
              <a href="#land" className="btn-line">
                Land
              </a>
              <a href="#services" className="btn-line">
                Services
              </a>
            </div>
          </section>
        </>
      );
    case "grounds-buildings": {
      const houses = fields.items.filter((item) => /\bhouse\b/i.test(item.title));
      const features = fields.items.filter((item) => !/\bhouse\b/i.test(item.title));
      return (
        <section id="buildings" className="wrap scroll-mt-24 pb-8">
          <div className="grid gap-4">
            {features.map((item, index) => {
              const photo = photoFor(item.title);
              return (
                <article
                  key={item.title}
                  className={`panel grid gap-0 overflow-hidden ${photo ? "md:grid-cols-2" : ""}`}
                >
                  {photo ? (
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className={`h-full min-h-64 w-full object-cover ${index % 2 ? "md:order-2" : ""}`}
                    />
                  ) : null}
                  <div className="flex flex-col justify-center p-6 sm:p-8">
                    <p className="text-sm text-accent">{item.stat}</p>
                    <h2 className="mt-2 text-4xl">{item.title}</h2>
                    <p className="mt-3 whitespace-pre-wrap text-muted">{item.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {houses.map((item, index) => {
              const photo = photoFor(item.title);
              return (
                <article key={item.title} className="panel overflow-hidden">
                  {photo ? (
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="aspect-3/2 w-full object-cover"
                    />
                  ) : null}
                  <div className="p-6">
                    <p className="text-sm text-accent">{item.stat}</p>
                    <h2 className="mt-2 text-3xl">{item.title}</h2>
                    <p className="mt-2 whitespace-pre-wrap text-muted">{item.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      );
    }
    case "grounds-land":
      return (
        <section id="land" className="wrap scroll-mt-24 py-16">
          {fields.kicker ? <p className="kicker">{fields.kicker}</p> : null}
          <h2 className="mt-3 text-4xl">{fields.title}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <img
              src="/images/whole.jpg"
              alt="Aerial of the ranch: houses, woods, and open fields"
              className="aspect-3/2 w-full object-cover"
            />
            <img
              src="/images/geodesic.jpg"
              alt="Geodesic temple with a blue metal roof, wooden doors, and a timber porch"
              className="aspect-3/2 w-full object-cover"
            />
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {fields.items.map((item) => (
              <li key={item.title} className="border border-border p-5">
                <p className="font-display text-4xl tabular-nums">{item.stat}</p>
                <p className="mt-1">{item.title}</p>
                <p className="mt-2 whitespace-pre-wrap text-muted">{item.text}</p>
              </li>
            ))}
          </ul>
          {fields.note ? (
            <p className="mt-6 max-w-3xl whitespace-pre-wrap text-muted">{fields.note}</p>
          ) : null}
        </section>
      );
    case "grounds-events":
      return (
        <section className="border-y border-border bg-surface">
          <div className="wrap py-16">
            {fields.kicker ? <p className="kicker">{fields.kicker}</p> : null}
            <h2 className="mt-3 text-4xl">{fields.title}</h2>
            <CardGrid items={fields.items} />
            {fields.note ? (
              <p className="mt-6 max-w-3xl whitespace-pre-wrap text-muted">{fields.note}</p>
            ) : null}
            <Link to="/events" className="btn mt-8">
              Request a quote
            </Link>
          </div>
        </section>
      );
    case "grounds-services":
      return (
        <section id="services" className="wrap scroll-mt-24 py-16">
          {fields.kicker ? <p className="kicker">{fields.kicker}</p> : null}
          <h2 className="mt-3 max-w-2xl text-4xl">{fields.title}</h2>
          <ul className="mt-8 divide-y divide-border border-y border-border">
            {fields.items.map((item) => (
              <li key={item.title} className="grid gap-2 py-5 md:grid-cols-3">
                <h3 className="text-2xl">{item.title}</h3>
                <p className="whitespace-pre-wrap text-muted md:col-span-2">{item.text}</p>
              </li>
            ))}
          </ul>
        </section>
      );
    case "grounds-reasons":
      return (
        <section className="wrap pb-20">
          <h2 className="text-4xl">{fields.title}</h2>
          <CardGrid items={fields.items} />
        </section>
      );
    case "stay-intro":
      return (
        <section className="wrap py-12">
          {fields.kicker ? <p className="kicker">{fields.kicker}</p> : null}
          <h1 className="mt-3 max-w-3xl text-5xl">{fields.title}</h1>
          <p className="mt-4 max-w-2xl whitespace-pre-wrap text-muted">{fields.body}</p>
        </section>
      );
    case "stay-calendars":
      return <StayCalendars panel={panel} inventory={inventory} />;
    case "stay-quote":
      return <StayQuote panel={panel} inventory={inventory} />;
    case "events-intro":
      return (
        <>
          <HeroImage src="/images/events-hero.jpg" webp="/images/events-hero.webp" alt="Campfire at dusk by the covered pavilion and geodesic dome" />
          <section className="wrap py-12">
            {fields.kicker ? <p className="kicker">{fields.kicker}</p> : null}
            <h1 className="mt-3 max-w-3xl text-5xl">{fields.title}</h1>
            <p className="mt-4 max-w-2xl whitespace-pre-wrap text-lg text-muted">{fields.body}</p>
            {fields.note ? <p className="mt-4 text-sm text-muted">{fields.note}</p> : null}
          </section>
        </>
      );
    case "events-list":
      return (
        <section className="wrap pb-4">
          <h2 className="text-4xl">{fields.title}</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fields.items.map((item, index) => (
              <li
                key={`${item.title}${index}`}
                className={
                  index === fields.items.length - 1
                    ? "border border-accent p-5"
                    : "border border-border p-5"
                }
              >
                <h3 className="text-2xl">{item.title}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{item.text}</p>
              </li>
            ))}
          </ul>
          {fields.note ? (
            <p className="mt-6 max-w-3xl text-sm whitespace-pre-wrap text-muted">{fields.note}</p>
          ) : null}
        </section>
      );
    case "events-quote":
      return <EventQuote panel={panel} inventory={inventory} />;
    case "vendors-intro":
      return (
        <section className="wrap py-12">
          {fields.kicker ? <p className="kicker">{fields.kicker}</p> : null}
          <h1 className="mt-3 max-w-3xl text-5xl">{fields.title}</h1>
          <p className="mt-4 max-w-2xl whitespace-pre-wrap text-lg text-muted">{fields.body}</p>
        </section>
      );
    case "vendors-points":
      return (
        <section className="wrap grid gap-4 pb-8 md:grid-cols-3">
          {fields.items.map((item) => (
            <article key={item.title} className="panel p-5">
              <h2 className="text-2xl">{item.title}</h2>
              <p className="mt-3 whitespace-pre-wrap text-muted">{item.text}</p>
            </article>
          ))}
        </section>
      );
    case "vendors-trades":
      return (
        <section className="wrap py-8">
          <h2 className="text-4xl">{fields.title}</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {fields.items.map((item) => (
              <li key={item.title} className="border border-border p-5">
                <h3 className="text-2xl">{item.title}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{item.text}</p>
              </li>
            ))}
          </ul>
        </section>
      );
    case "vendors-apply":
      return (
        <section className="wrap pb-8">
          <VendorForm panel={panel} />
        </section>
      );
    case "vendors-faq":
      return (
        <section className="wrap pb-20">
          <h2 className="text-4xl">{fields.title}</h2>
          <dl className="mt-6 divide-y divide-border border-y border-border">
            {fields.items.map((item) => (
              <div key={item.title} className="grid gap-2 py-5 md:grid-cols-3">
                <dt className="font-display text-2xl">{item.title}</dt>
                <dd className="whitespace-pre-wrap text-muted md:col-span-2">{item.text}</dd>
              </div>
            ))}
          </dl>
        </section>
      );
    default:
      return null;
  }
}

function StatList({ items }: { items: PanelItem[] }) {
  return (
    <ul className="divide-y divide-border border-y border-border">
      {items.map((item) => (
        <li key={item.title} className="grid grid-cols-3 gap-4 py-4">
          <p className="font-display text-3xl tabular-nums leading-none">{item.stat}</p>
          <div className="col-span-2">
            <p>{item.title}</p>
            <p className="text-sm whitespace-pre-wrap text-muted">{item.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function CardGrid({ items, panel = false }: { items: PanelItem[]; panel?: boolean }) {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <article
          key={item.title}
          className={panel ? "panel p-5" : "border border-border bg-bg p-5"}
        >
          <h3 className={panel ? "text-2xl" : "text-3xl"}>{item.title}</h3>
          <p className="mt-3 whitespace-pre-wrap text-muted">{item.text}</p>
        </article>
      ))}
    </div>
  );
}

function combined(stays: Space[]): { weekday: number | null; weekend: number | null } {
  const priced = stays.filter((stay) => stay.weekdayRate != null && stay.weekendRate != null);
  if (!priced.length) return { weekday: null, weekend: null };
  return {
    weekday: priced.reduce((sum, stay) => sum + (stay.weekdayRate ?? 0), 0),
    weekend: priced.reduce((sum, stay) => sum + (stay.weekendRate ?? 0), 0),
  };
}

function stayMeta(stay: Space): string {
  return (
    [
      stay.sqft ? `${stay.sqft.toLocaleString()} sq ft` : null,
      stay.sleeps ? `sleeps ${stay.sleeps}` : null,
    ]
      .filter(Boolean)
      .join(" · ") || "Stay"
  );
}

function StayCalendars({ panel, inventory }: { panel: Panel; inventory: Inventory }) {
  const { pick, setPick } = useStayPick();
  const stays = inventory.spaces.filter((space) => space.kind === "stay");
  const whole = combined(stays);
  return (
    <section className="wrap grid gap-6 pb-8 lg:grid-cols-2">
      {stays.map((stay) => (
        <CalendarCard
          key={stay.slug}
          title={stay.name}
          image={stay.image}
          meta={stayMeta(stay)}
          summary={stay.summary}
          weekday={stay.weekdayRate}
          weekend={stay.weekendRate}
          blocks={inventory.blocks.filter((block) => block.slug === stay.slug)}
          start={pick.slug === stay.slug ? pick.start : null}
          end={pick.slug === stay.slug ? pick.end : null}
          onChange={(start, end) => setPick({ slug: stay.slug, start, end })}
        />
      ))}
      <CalendarCard
        title={panel.fields.title}
        image="/images/whole.jpg"
        meta={panel.fields.kicker}
        summary={panel.fields.body}
        weekday={whole.weekday}
        weekend={whole.weekend}
        blocks={inventory.blocks.filter((block) =>
          inventory.spaces.some((space) => space.inBuyout && space.slug === block.slug),
        )}
        start={pick.slug === "whole" ? pick.start : null}
        end={pick.slug === "whole" ? pick.end : null}
        onChange={(start, end) => setPick({ slug: "whole", start, end })}
      />
    </section>
  );
}

function CalendarCard({
  title,
  image,
  meta,
  summary,
  weekday,
  weekend,
  blocks,
  start,
  end,
  onChange,
}: {
  title: string;
  image: string | null;
  meta: string;
  summary: string;
  weekday: number | null;
  weekend: number | null;
  blocks: { start: string; end: string }[];
  start: string | null;
  end: string | null;
  onChange: (start: string, end: string | null) => void;
}) {
  return (
    <article className="panel p-4 sm:p-5">
      {image ? <img src={image} alt="" className="aspect-3/2 w-full object-cover" /> : null}
      <h2 className="mt-4 text-3xl">{title}</h2>
      <p className="mt-1 text-sm text-accent">{meta}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{summary}</p>
      {weekday != null && weekend != null ? (
        <p className="mt-3 text-sm">
          <span className="tabular-nums">{money(weekday)}</span>
          <span className="text-muted"> Sun–Thu · </span>
          <span className="tabular-nums">{money(weekend)}</span>
          <span className="text-muted"> Fri–Sat</span>
        </p>
      ) : (
        <p className="mt-3 text-sm text-muted">It comes with the land. No separate nightly rate.</p>
      )}
      <div className="mt-4">
        <RangeCalendar
          blocks={blocks}
          start={start}
          end={end}
          weekdayRate={weekday}
          weekendRate={weekend}
          onChange={onChange}
        />
      </div>
    </article>
  );
}

function StayQuote({ panel, inventory }: { panel: Panel; inventory: Inventory }) {
  const { pick } = useStayPick();
  const stays = inventory.spaces.filter((space) => space.kind === "stay");
  const whole = combined(stays);
  const chosen = pick.slug === "whole" ? null : stays.find((stay) => stay.slug === pick.slug);
  const rates =
    pick.slug === "whole"
      ? whole
      : { weekday: chosen?.weekdayRate ?? null, weekend: chosen?.weekendRate ?? null };
  const subject =
    pick.slug === "whole"
      ? panelById(inventory.panels, "stay-calendars").fields.title
      : (chosen?.name ?? "Stay");
  const posted =
    pick.start && pick.end && rates.weekday != null && rates.weekend != null
      ? stayTotal(pick.start, pick.end, rates.weekday, rates.weekend)
      : null;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [party, setParty] = useState(2);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!pick.start || !pick.end) {
      setError("Choose the nights on a calendar first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await submitInquiry({
        data: {
          kind: "stay",
          contactName: name,
          email,
          phone,
          subject,
          start: pick.start,
          end: pick.end,
          partySize: party,
          note,
        },
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCode(result.refCode);
      setName("");
      setEmail("");
      setPhone("");
      setNote("");
    } catch {
      setError("The quote did not go through. Try once more.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="wrap pb-20">
      <form className="panel p-5 sm:p-6" onSubmit={(event) => void submit(event)}>
        <h2 className="text-3xl">{panel.fields.title}</h2>
        <p className="mt-2 text-muted">
          {pick.start && pick.end
            ? `${subject}. ${formatHold(pick.start, pick.end, "nights")}${posted != null ? `. Posted ${money(posted)}.` : "."}`
            : panel.fields.note}
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="label">Full name</span>
            <input
              className="control"
              required
              minLength={2}
              maxLength={80}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label>
            <span className="label">Email</span>
            <input
              className="control"
              type="email"
              required
              maxLength={120}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            <span className="label">Phone</span>
            <input
              className="control"
              type="tel"
              required
              minLength={7}
              maxLength={30}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>
          <label>
            <span className="label">People</span>
            <input
              className="control"
              type="number"
              min={1}
              max={500}
              value={party}
              onChange={(event) => setParty(Number(event.target.value))}
            />
          </label>
        </div>
        <label className="mt-4 block">
          <span className="label">Note</span>
          <textarea
            className="control"
            maxLength={600}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="A race weekend, a wedding party, a quiet few nights. Whatever we should know."
          />
        </label>
        <button className="btn mt-6" type="submit" disabled={busy}>
          {busy ? "Sending…" : "Request a quote"}
        </button>
        {error ? (
          <p className="mt-4 text-accent" role="alert">
            {error}
          </p>
        ) : null}
        {code ? (
          <p className="mt-4 border border-accent p-4" role="status">
            Quote <span className="font-display text-2xl">{code}</span> is on the ranch desk. We
            will answer at the email you gave.
          </p>
        ) : null}
      </form>
    </section>
  );
}

function EventQuote({ panel, inventory }: { panel: Panel; inventory: Inventory }) {
  const kinds = panelById(inventory.panels, "events-list")
    .fields.items.map((item) => item.title)
    .filter(Boolean);
  const [kind, setKind] = useState(kinds[1] || kinds[0] || "Corporate");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [party, setParty] = useState(40);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      let rangeStart: string | null = start || null;
      let rangeEnd: string | null = end || null;
      if (rangeStart && rangeEnd && rangeStart === rangeEnd) rangeEnd = addDays(rangeStart, 1);
      const result = await submitInquiry({
        data: {
          kind: "event",
          contactName: name,
          email,
          phone,
          subject: kind,
          start: rangeStart,
          end: rangeEnd,
          partySize: party,
          note,
        },
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCode(result.refCode);
      setName("");
      setEmail("");
      setPhone("");
      setNote("");
      setStart("");
      setEnd("");
    } catch {
      setError("The quote did not go through. Try once more.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="wrap py-12">
      <form className="panel max-w-3xl p-5 sm:p-6" onSubmit={(event) => void submit(event)}>
        <h2 className="text-3xl">{panel.fields.title}</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{panel.fields.body}</p>
        <label className="mt-5 block">
          <span className="label">What it is</span>
          <select
            className="control"
            value={kind}
            onChange={(event) => setKind(event.target.value)}
          >
            {kinds.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="label">Full name</span>
            <input
              className="control"
              required
              minLength={2}
              maxLength={80}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label>
            <span className="label">Email</span>
            <input
              className="control"
              type="email"
              required
              maxLength={120}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            <span className="label">Phone</span>
            <input
              className="control"
              type="tel"
              required
              minLength={7}
              maxLength={30}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>
          <label>
            <span className="label">Headcount</span>
            <input
              className="control"
              type="number"
              min={1}
              max={500}
              value={party}
              onChange={(event) => setParty(Number(event.target.value))}
            />
          </label>
          <label>
            <span className="label">First day</span>
            <input
              className="control"
              type="date"
              value={start}
              onChange={(event) => setStart(event.target.value)}
            />
          </label>
          <label>
            <span className="label">Last day</span>
            <input
              className="control"
              type="date"
              value={end}
              onChange={(event) => setEnd(event.target.value)}
            />
          </label>
        </div>
        <p className="mt-2 text-sm text-muted">
          If you fill one date, fill both. The last day is the morning you are done, not an extra
          night.
        </p>
        <label className="mt-4 block">
          <span className="label">What the day needs</span>
          <textarea
            className="control"
            maxLength={600}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Meals, lodging, a station, a return next year. Leave it blank if the category is enough."
          />
        </label>
        <button className="btn mt-6" type="submit" disabled={busy}>
          {busy ? "Sending…" : "Request a quote"}
        </button>
        {error ? (
          <p className="mt-4 text-accent" role="alert">
            {error}
          </p>
        ) : null}
        {code ? (
          <p className="mt-4 border border-accent p-4" role="status">
            Quote <span className="font-display text-2xl">{code}</span> is on the ranch desk. We
            will answer at the email you gave.
          </p>
        ) : null}
      </form>
    </section>
  );
}

function VendorForm({ panel }: { panel: Panel }) {
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [primary, setPrimary] = useState<(typeof WORKS)[number]>("Weddings");
  const [also, setAlso] = useState<string[]>([]);
  const [years, setYears] = useState(1);
  const [insured, setInsured] = useState<"yes" | "no" | "">("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");

  function toggle(item: string) {
    setAlso((current) =>
      current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item],
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (insured !== "yes" && insured !== "no") {
      setError("Say whether you carry liability insurance.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await submitVendor({
        data: {
          businessName,
          contactName,
          email,
          phone,
          area,
          website,
          instagram,
          primary,
          also: also.filter((item): item is (typeof WORKS)[number] =>
            (WORKS as readonly string[]).includes(item),
          ),
          years,
          insured: insured === "yes",
        },
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCode(result.refCode);
      setBusinessName("");
      setContactName("");
      setEmail("");
      setPhone("");
      setArea("");
      setWebsite("");
      setInstagram("");
      setAlso([]);
    } catch {
      setError("The application did not save. Check the fields and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="panel max-w-3xl p-5 sm:p-6" onSubmit={(event) => void submit(event)}>
      <h2 className="text-3xl">{panel.fields.title}</h2>
      <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{panel.fields.body}</p>
      <label className="mt-5 block">
        <span className="label">Business name</span>
        <input
          className="control"
          value={businessName}
          onChange={(event) => setBusinessName(event.target.value)}
          required
          minLength={2}
          maxLength={120}
        />
      </label>
      <label className="mt-4 block">
        <span className="label">Your full name</span>
        <input
          className="control"
          value={contactName}
          onChange={(event) => setContactName(event.target.value)}
          required
          minLength={2}
          maxLength={120}
        />
      </label>
      <label className="mt-4 block">
        <span className="label">Email</span>
        <input
          className="control"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          maxLength={120}
        />
      </label>
      <label className="mt-4 block">
        <span className="label">Phone</span>
        <input
          className="control"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          required
          minLength={7}
          maxLength={30}
        />
      </label>
      <label className="mt-4 block">
        <span className="label">Area you are based in</span>
        <input
          className="control"
          value={area}
          onChange={(event) => setArea(event.target.value)}
          required
          minLength={2}
          maxLength={80}
          placeholder="Austin, Del Valle, Central Texas"
        />
      </label>
      <label className="mt-4 block">
        <span className="label">Website</span>
        <input
          className="control"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          placeholder="https://"
          inputMode="url"
        />
      </label>
      <label className="mt-4 block">
        <span className="label">Instagram</span>
        <input
          className="control"
          value={instagram}
          onChange={(event) => setInstagram(event.target.value)}
          placeholder="@studio"
          maxLength={120}
        />
      </label>
      <label className="mt-4 block">
        <span className="label">Primary category</span>
        <select
          className="control"
          value={primary}
          onChange={(event) => setPrimary(event.target.value as (typeof WORKS)[number])}
        >
          {WORKS.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <fieldset className="mt-4">
        <legend className="label">Also available for</legend>
        <div className="flex flex-wrap gap-2">
          {WORKS.filter((item) => item !== primary).map((item) => {
            const on = also.includes(item);
            return (
              <button
                key={item}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(item)}
                className={on ? "btn" : "btn-line"}
              >
                {item}
              </button>
            );
          })}
        </div>
      </fieldset>
      <label className="mt-4 block">
        <span className="label">Years in business</span>
        <input
          className="control"
          type="number"
          min={0}
          max={80}
          required
          value={years}
          onChange={(event) => setYears(Number(event.target.value))}
        />
      </label>
      <label className="mt-4 block">
        <span className="label">Liability insurance</span>
        <select
          className="control"
          required
          value={insured}
          onChange={(event) => setInsured(event.target.value as "yes" | "no" | "")}
        >
          <option value="">Choose</option>
          <option value="yes">Yes, we carry it</option>
          <option value="no">Not yet</option>
        </select>
      </label>
      <button className="btn mt-6" type="submit" disabled={busy}>
        {busy ? "Saving…" : "Submit the application"}
      </button>
      {error ? (
        <p className="mt-4 text-accent" role="alert">
          {error}
        </p>
      ) : null}
      {code ? (
        <p className="mt-4 border border-accent p-4" role="status">
          Logged as <span className="font-display text-2xl">{code}</span>. The desk has the
          business, the name, and how to reach you.
        </p>
      ) : null}
    </form>
  );
}
