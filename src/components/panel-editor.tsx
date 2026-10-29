import { useState } from "react";
import { movePanel, placePanel, savePanelFields, setPanelHidden } from "@/lib/ranch/api";
import { PAGES, type PageId, type Panel, type PanelFields } from "@/lib/ranch/panels";

type Run = (work: () => Promise<{ ok: boolean; error?: string } | { ok: true }>, success: string) => void;

export function PanelEditor({ panels, onRun }: { panels: Panel[]; onRun: Run }) {
  const [page, setPage] = useState<PageId | "hidden">("home");
  const shown = panels
    .filter((panel) => (page === "hidden" ? panel.hidden : panel.page === page && !panel.hidden))
    .sort((a, b) => a.sort - b.sort || a.label.localeCompare(b.label));

  return (
    <section className="wrap pb-12">
      <h2 className="text-3xl">Words and panels</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Change the words, then save that panel. Move a panel up or down on its page, or send it to another page.
        Hidden panels stay off the site until you show them again. Calendars, forms, and photos keep working wherever
        you put them.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {PAGES.map((item) => (
          <button key={item.id} type="button" className={page === item.id ? "btn" : "btn-line"} onClick={() => setPage(item.id)}>
            {item.label}
          </button>
        ))}
        <button type="button" className={page === "hidden" ? "btn" : "btn-line"} onClick={() => setPage("hidden")}>
          Hidden
        </button>
      </div>
      <div className="mt-6 space-y-4">
        {shown.length === 0 ? <p className="text-muted">Nothing is in this list.</p> : null}
        {shown.map((panel, index) => (
          <article key={`${panel.id}${panel.sort}${panel.page}${panel.hidden}`} className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-2xl">{panel.label}</h3>
              <div className="flex flex-wrap gap-2">
                {page !== "hidden" ? (
                  <>
                    <button
                      type="button"
                      className="btn-line"
                      disabled={index === 0}
                      onClick={() => void onRun(() => movePanel({ data: { id: panel.id, dir: -1 } }), `${panel.label} moved up.`)}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      className="btn-line"
                      disabled={index === shown.length - 1}
                      onClick={() => void onRun(() => movePanel({ data: { id: panel.id, dir: 1 } }), `${panel.label} moved down.`)}
                    >
                      Down
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  className="btn-line"
                  onClick={() =>
                    void onRun(
                      () => setPanelHidden({ data: { id: panel.id, hidden: !panel.hidden } }),
                      panel.hidden ? `${panel.label} is back on the page.` : `${panel.label} is hidden.`,
                    )
                  }
                >
                  {panel.hidden ? "Show" : "Hide"}
                </button>
              </div>
            </div>
            <label className="mt-4 block max-w-xs">
              <span className="label">Page</span>
              <select
                className="control"
                value={panel.page}
                onChange={(event) => {
                  const next = event.target.value as PageId;
                  if (next === panel.page) return;
                  void onRun(() => placePanel({ data: { id: panel.id, page: next } }), `${panel.label} is now on ${PAGES.find((item) => item.id === next)?.label}.`);
                }}
              >
                {PAGES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <WordsForm panel={panel} onRun={onRun} />
          </article>
        ))}
      </div>
    </section>
  );
}

function WordsForm({ panel, onRun }: { panel: Panel; onRun: Run }) {
  const [fields, setFields] = useState<PanelFields>(panel.fields);
  const hasWords = panel.edit.kicker || panel.edit.title || panel.edit.body || panel.edit.note || panel.itemMode !== "none";
  if (!hasWords) {
    return <p className="mt-3 text-sm text-muted">No words on this one. Move it, or hide it.</p>;
  }
  const showStat = panel.itemMode === "stat-title" || panel.itemMode === "stat-title-text";
  const showText = panel.itemMode === "title-text" || panel.itemMode === "stat-title-text";
  const showTitle = panel.itemMode !== "none";

  function setItem(index: number, key: "stat" | "title" | "text", value: string) {
    setFields((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)),
    }));
  }

  return (
    <form
      className="mt-4 grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        void onRun(() => savePanelFields({ data: { id: panel.id, fields } }), `${panel.label} saved.`);
      }}
    >
      {panel.edit.kicker ? (
        <label>
          <span className="label">Small line</span>
          <input className="control" maxLength={180} value={fields.kicker} onChange={(event) => setFields({ ...fields, kicker: event.target.value })} />
        </label>
      ) : null}
      {panel.edit.title ? (
        <label>
          <span className="label">Heading</span>
          <input className="control" maxLength={200} value={fields.title} onChange={(event) => setFields({ ...fields, title: event.target.value })} />
        </label>
      ) : null}
      {panel.edit.body ? (
        <label>
          <span className="label">Paragraph</span>
          <textarea className="control" maxLength={1200} value={fields.body} onChange={(event) => setFields({ ...fields, body: event.target.value })} />
        </label>
      ) : null}
      {panel.edit.note ? (
        <label>
          <span className="label">Note under it</span>
          <textarea className="control" maxLength={1200} value={fields.note} onChange={(event) => setFields({ ...fields, note: event.target.value })} />
        </label>
      ) : null}
      {fields.items.map((item, index) => (
        <fieldset key={index} className="grid gap-3 border border-border p-3">
          <legend className="px-1 text-sm text-muted">Card {index + 1}</legend>
          {showStat ? (
            <label>
              <span className="label">Short line</span>
              <input className="control" maxLength={80} value={item.stat} onChange={(event) => setItem(index, "stat", event.target.value)} />
            </label>
          ) : null}
          {showTitle ? (
            <label>
              <span className="label">Heading</span>
              <input className="control" maxLength={160} value={item.title} onChange={(event) => setItem(index, "title", event.target.value)} />
            </label>
          ) : null}
          {showText ? (
            <label>
              <span className="label">Words</span>
              <textarea className="control" maxLength={1200} value={item.text} onChange={(event) => setItem(index, "text", event.target.value)} />
            </label>
          ) : null}
        </fieldset>
      ))}
      <button className="btn w-fit" type="submit">
        Save words
      </button>
    </form>
  );
}
