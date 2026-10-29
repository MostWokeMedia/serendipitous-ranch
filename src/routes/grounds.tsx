import { createFileRoute } from "@tanstack/react-router";
import { driveItems, PageStack } from "@/components/site-panels";
import { SiteFrame } from "@/components/site-frame";
import { getInventory } from "@/lib/ranch/api";

export const Route = createFileRoute("/grounds")({
  loader: () => getInventory(),
  head: () => ({
    meta: [
      { title: "Grounds · Serendipitous Ranch" },
      {
        name: "description",
        content: "Pavilion, adobe temple, geodesic temple, pond, rainwater, RV hookups, and the open grass.",
      },
    ],
  }),
  component: GroundsPage,
});

function GroundsPage() {
  const data = Route.useLoaderData();
  return (
    <SiteFrame drives={driveItems(data)}>
      <PageStack page="grounds" inventory={data} />
    </SiteFrame>
  );
}
