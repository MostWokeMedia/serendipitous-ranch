import { useEffect, useRef, useState } from "react";

const ALT = "Serendipitous Ranch. A place to slow down and reconnect. Del Valle, Texas.";

/** Homepage hero: looping drone video with logo/text baked in, plus a subtle scroll parallax. */
export function HeroVideo() {
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
      el.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0) scale(1.1)`;
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
    <div ref={frame} className="relative w-full overflow-hidden bg-black" style={{ aspectRatio: "1672 / 941" }}>
      <div ref={layer} className="absolute inset-0 will-change-transform" style={{ transform: still ? undefined : "scale(1.1)" }}>
        {still ? (
          <img src="/images/hero.jpg" alt={ALT} className="h-full w-full object-cover" width={1672} height={941} />
        ) : (
          <video
            className="h-full w-full object-cover"
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
        )}
      </div>
    </div>
  );
}
