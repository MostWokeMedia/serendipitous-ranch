import { createFileRoute } from "@tanstack/react-router";
import { driveItems, PageStack } from "@/components/site-panels";
import { SiteFrame } from "@/components/site-frame";
import { getInventory } from "@/lib/ranch/api";

export const Route = createFileRoute("/vendors")({
  loader: () => getInventory(),
  head: () => ({
    meta: [
      { title: "Vendors · Serendipitous Ranch" },
      {
        name: "description",
        content: "Apply to work weddings, corporate days, birthdays, retreats, and race weekends at Serendipitous Ranch.",
      },
    ],
  }),
  component: VendorsPage,
});

function VendorsPage() {
  const data = Route.useLoaderData();
  return (
    <SiteFrame drives={driveItems(data)}>
      <PageStack page="vendors" inventory={data} />
    </SiteFrame>
  );
}
