import { useEffect, useState } from "react";

export function FeedLink({ slug, name }: { slug: string; name: string }) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  const path = `/api/ical/${slug}`;
  const url = origin ? `${origin}${path}` : path;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <code className="block flex-1 overflow-x-auto border border-border bg-bg px-3 py-3 text-sm text-muted">
        {url}
      </code>
      <button
        type="button"
        className="btn-line"
        onClick={() => {
          void navigator.clipboard.writeText(origin ? url : `${window.location.origin}${path}`).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          });
        }}
      >
        {copied ? "Copied" : `Copy ${name} feed`}
      </button>
    </div>
  );
}
