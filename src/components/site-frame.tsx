import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ADDRESS, DRIVES, MAPS } from "@/lib/ranch/content";

const LINKS = [
  { to: "/stay", label: "Stay" },
  { to: "/grounds", label: "Grounds" },
  { to: "/events", label: "Events" },
  { to: "/vendors", label: "Vendors" },
] as const;

function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
      <path
        d="M16 3 L27.5 9.5 V22.5 L16 29 L4.5 22.5 V9.5 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="16" cy="16" r="1.7" fill="currentColor" />
    </svg>
  );
}

export function SiteFrame({
  children,
  hero = false,
  drives = DRIVES,
}: {
  children: ReactNode;
  hero?: boolean;
  drives?: { value: string; label: string }[];
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-svh">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-accent focus:px-3 focus:py-2 focus:text-bg"
      >
        Skip to content
      </a>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md">
        <div className="wrap flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 text-fg">
            <Mark />
            <span className="font-display text-lg leading-none">
              Serendipitous
              <span className="hidden sm:inline"> Ranch</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="min-h-11 px-3 py-2"
                activeProps={{ className: "text-accent" }}
                inactiveProps={{ className: "text-muted" }}
              >
                {l.label}
              </Link>
            ))}
            <Link to="/events" className="btn ml-2">
              Request a quote
            </Link>
          </nav>
          <button
            type="button"
            className="btn-line md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
        {open ? (
          <nav id="mobile-nav" className="border-t border-border md:hidden" aria-label="Mobile">
            <div className="wrap flex flex-col py-2">
              {LINKS.map((l) => (
                <Link key={l.to} to={l.to} className="min-h-11 py-3 text-lg text-fg">
                  {l.label}
                </Link>
              ))}
              <Link to="/events" className="btn my-3">
                Request a quote
              </Link>
            </div>
          </nav>
        ) : null}
      </header>
      <main id="content" className={hero ? "" : "pt-16"}>
        {children}
      </main>
      <footer className="border-t border-border">
        <div className="wrap grid gap-8 py-12 md:grid-cols-3">
          <div>
            <p className="font-display text-2xl">Serendipitous Ranch</p>
            <p className="mt-3 text-muted">
              <a href={MAPS} className="underline decoration-border underline-offset-4">
                {ADDRESS}
              </a>
            </p>
          </div>
          <ul className="space-y-2 text-muted">
            {drives.map((d) => (
              <li key={d.label}>
                <span className="text-fg tabular-nums">{d.value}</span> to {d.label}
              </li>
            ))}
          </ul>
          <div className="text-muted md:text-right">
            <p>Del Valle, Texas · 42 acres</p>
            <Link to="/steward" className="mt-3 inline-flex min-h-11 items-center text-sm underline decoration-border underline-offset-4">
              Ranch desk
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
