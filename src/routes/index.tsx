import { createFileRoute } from "@tanstack/react-router";
import { driveItems, PageStack } from "@/components/site-panels";
import { SiteFrame } from "@/components/site-frame";
import { getInventory } from "@/lib/ranch/api";

export const Route = createFileRoute("/")({
  loader: () => getInventory(),
  component: Home,
});

function Home() {
  const data = Route.useLoaderData();
  return (
    <SiteFrame drives={driveItems(data)}>
      <PageStack page="home" inventory={data} />
    </SiteFrame>
  );
}
