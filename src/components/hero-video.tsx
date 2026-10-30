import type React from "react";
import { useEffect, useRef, useState } from "react";

const ALT = "Serendipitous Ranch. A place to slow down and reconnect. Del Valle, Texas.";

/** Shared full-bleed hero frame: edge-to-edge, overflow hidden, 0.4x scroll parallax; static under reduced motion. */
function HeroFrame({
  children,
  trim = false,
}: {
  children: (still: boolean) => React.ReactNode;
  trim?: boolean;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = layer.current;
    const box = frame.current;
    if (!el || !box) return;
    if (still) {
      el.style.transform = "";
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const top = box.getBoundingClientRect().top;
      const shift = Math.max(0, -top) * 0.4;
      el.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [still]);

  return (
    <div
      ref={frame}
      className={`relative w-full overflow-hidden bg-black${trim ? " aspect-[1672/941] md:aspect-[1672/828]" : ""}`}
      style={trim ? undefined : { aspectRatio: "1672 / 941" }}
    >
      <div ref={layer} className="absolute inset-0 will-change-transform">
        {children(still)}
      </div>
    </div>
  );
}

/** Homepage hero: looping drone video with logo/text baked in. */
export function HeroVideo() {
  return (
    <HeroFrame trim>
      {(still) =>
        still ? (
          <img
            src="/images/hero.jpg"
            alt={ALT}
            className="h-full w-full object-cover md:object-bottom"
            width={1672}
            height={941}
          />
        ) : (
          <video
            className="h-full w-full object-cover md:object-bottom"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/videos/hero-poster.jpg"
            aria-label={ALT}
          >
            <source src="/videos/hero.webm" type="video/webm" />
            <source src="/videos/hero.mp4" type="video/mp4" />
            <img src="/images/hero.jpg" alt={ALT} width={1672} height={941} />
          </video>
        )
      }
    </HeroFrame>
  );
}

/** Static photo hero in the same frame as the homepage video. */
export function HeroImage({
  src,
  webp,
  alt,
  stats,
  overlay,
  className,
  trim,
}: {
  src: string;
  webp?: string;
  alt: string;
  stats?: { stat: string; title: string; text?: string }[];
  /** Static layer over the photo (not in the parallax layer). */
  overlay?: React.ReactNode;
  /** Extra classes on the outer wrapper (e.g. a narrower desktop width). */
  className?: string;
  /** Desktop-only 12% top trim, image anchored to the bottom. */
  trim?: boolean;
}) {
  const frame = (
    <HeroFrame trim={trim}>
      {() => (
        <picture>
          {webp ? <source srcSet={webp} type="image/webp" /> : null}
          <img src={src} alt={alt} className={`h-full w-full object-cover${trim ? " md:object-bottom" : ""}`} fetchPriority="high" />
        </picture>
      )}
    </HeroFrame>
  );
  const shown = (stats ?? []).filter((item) => item.stat.trim() !== "");
  if (!shown.length && !overlay) return frame;
  if (!shown.length) {
    return (
      <div className={`relative ${className ?? ""}`}>
        {frame}
        {overlay}
      </div>
    );
  }
  return (
    <div className="relative">
      {frame}
      {/* Stats sit over the photo on desktop (outside the parallax layer); under it on small screens. */}
      <div
        className="pointer-events-none absolute inset-0 hidden md:block"
        style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.15) 100%)" }}
      />
      {overlay}
      <HeroStats items={shown} />
    </div>
  );
}

function HeroStats({ items }: { items: { stat: string; title: string; text?: string }[] }) {
  const box = useRef<HTMLUListElement>(null);
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    const el = box.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    setProgress(0);
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / 1500);
          setProgress(1 - Math.pow(1 - t, 3));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <ul
      ref={box}
      className="grid grid-cols-2 gap-2 bg-black p-2 md:absolute md:bottom-[5%] md:left-1/2 md:w-[min(900px,calc(100%-4rem))] md:-translate-x-1/2 md:gap-3 md:bg-transparent md:p-0"
    >
      {items.map((item) => (
        <li
          key={item.title}
          className="border border-white/25 p-3 text-white backdrop-blur-md md:p-4 lg:p-5"
          style={{ background: "rgba(20,16,12,0.45)" }}
        >
          <p className="font-display text-2xl tabular-nums md:text-3xl lg:text-4xl">{countTo(item.stat, progress)}</p>
          <p className="mt-1 text-sm md:text-base">{item.title}</p>
          {item.text ? <p className="mt-2 hidden text-sm text-white/80 md:block">{item.text}</p> : null}
        </li>
      ))}
    </ul>
  );
}

/** Scale the first number in a stat ("63,000 gallons", "10+") by progress, keeping its formatting. */
function countTo(stat: string, progress: number): string {
  if (progress >= 1) return stat;
  const match = stat.match(/\d[\d,]*(\.\d+)?/);
  if (!match || match.index === undefined) return stat;
  const raw = match[0];
  const decimals = match[1] ? match[1].length - 1 : 0;
  const target = Number(raw.replace(/,/g, ""));
  const value = (target * progress).toFixed(decimals);
  const text = raw.includes(",") ? Number(value).toLocaleString("en-US", { minimumFractionDigits: decimals }) : value;
  return stat.slice(0, match.index) + text + stat.slice(match.index + raw.length);
}
