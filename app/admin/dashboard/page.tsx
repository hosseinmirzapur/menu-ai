import { checkAdminAuth, adminLogout } from "@/actions/index";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboardPage() {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    redirect("/admin");
  }

  return <AdminDashboardClient />;
}
