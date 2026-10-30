import { createFileRoute } from "@tanstack/react-router";
import { driveItems, PageStack } from "@/components/site-panels";
import { SiteFrame } from "@/components/site-frame";
import { getInventory } from "@/lib/ranch/api";

export const Route = createFileRoute("/stay")({
  loader: () => getInventory(),
  head: () => ({
    meta: [
      { title: "Stay · Serendipitous Ranch" },
      {
        name: "description",
        content: "Nightly rates on the calendar for the ranch house and the whole property. The geodesic temple comes with the land.",
      },
    ],
  }),
  component: StayPage,
});

function StayPage() {
  const data = Route.useLoaderData();
  return (
    <SiteFrame drives={driveItems(data)}>
      <PageStack page="stay" inventory={data} />
    </SiteFrame>
  );
}
