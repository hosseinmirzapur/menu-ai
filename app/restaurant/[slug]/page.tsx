import { getRestaurantBySlug, getDbMenuItems } from "@/lib/db";
import { getMenuItems } from "@/lib/menu";
import { notFound } from "next/navigation";
import CustomerMenuPage from "./CustomerMenuPage";

export default async function RestaurantPage({
  params,
}: {
  params: { slug: string };
}) {
  const restaurant = await getRestaurantBySlug(params.slug);
  if (!restaurant) notFound();

  const dbItems = await getDbMenuItems(restaurant.id);
  const menuItems = dbItems.length > 0 ? dbItems : getMenuItems(params.slug);

  return <CustomerMenuPage restaurant={restaurant} menuItems={menuItems} />;
}
