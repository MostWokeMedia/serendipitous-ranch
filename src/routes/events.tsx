import { createFileRoute } from "@tanstack/react-router";
import { driveItems, PageStack } from "@/components/site-panels";
import { SiteFrame } from "@/components/site-frame";
import { getInventory } from "@/lib/ranch/api";

export const Route = createFileRoute("/events")({
  loader: () => getInventory(),
  head: () => ({
    meta: [
      { title: "Events · Serendipitous Ranch" },
      {
        name: "description",
        content: "Weddings, corporate days, birthdays, retreats, and race weekends on 42 acres in Del Valle. Ask for a quote.",
      },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const data = Route.useLoaderData();
  return (
    <SiteFrame drives={driveItems(data)}>
      <PageStack page="events" inventory={data} />
    </SiteFrame>
  );
}
